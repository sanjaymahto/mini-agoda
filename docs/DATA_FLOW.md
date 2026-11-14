# Data Flow - Explained Simply

> **Goal of this document:** understand how data moves through Mini Agoda
> without needing to know Module Federation, React or Vite in depth.
> If you only read one doc, read this one.

---

## 1. The 30-second mental model

Think of Mini Agoda as a **shopping mall**:

| Mall                         | Mini Agoda                                                       |
| ---------------------------- | ---------------------------------------------------------------- |
| The mall building & corridors | **Shell** - header, footer, routing (decides which shop you're in) |
| Individual shops              | **Micro frontends** - Search, Hotel, Booking, Account            |
| Shop's own staff              | Each MFE's own React components & CSS                            |
| Mall-wide PA announcements    | **Event bus** (`eventBus.emit(...)`)                             |
| Shared notice board           | **Shared store** (logged-in user, currency, wishlist)            |
| Ticket you carry between shops | **URL query parameters** (`?checkIn=...&adults=2`)              |
| The warehouse                 | **Mock API** (`api.*`) backed by `localStorage`                  |

Each shop (MFE) is built and deployed separately, but when you walk through the
mall it feels like one building. Shops **never walk into each other's back
rooms** (no direct imports between MFEs) - they talk only through the ticket
(URL), the notice board (store) or announcements (events).

---

## 2. The big picture

```mermaid
flowchart LR
    User((Traveller)) --> Browser

    subgraph Browser["Browser tab - http://localhost:3000"]
        Shell["Shell (host)<br/>header · routing · toasts"]
        Search["Search MFE"]
        Hotel["Hotel MFE"]
        Booking["Booking MFE"]
        Account["Account MFE"]

        subgraph Shared["@mini-agoda/shared (one instance)"]
            Store[("Store<br/>user · currency · wishlist")]
            Bus{{"Event bus"}}
            API["Mock API"]
        end

        Shell --> Search & Hotel & Booking & Account
        Search & Hotel & Booking & Account --> Shared
        Shell --> Shared
    end

    API <--> LS[("localStorage<br/>'database'")]
```

- **Every arrow into `Shared` is a normal function call.** Because the shared
  package is loaded exactly once (a Module Federation *singleton*), all MFEs see
  the same store, the same event bus and the same API.
- **The API is the only thing that touches persistent data.** Today it is mock
  data + `localStorage`; tomorrow it can be `fetch()` calls to a real backend
  without changing any MFE.

---

## 3. Three ways data moves (and when to use each)

```mermaid
flowchart TB
    subgraph A["1 - URL (the ticket)"]
        direction LR
        S1[Search] -- "/hotel/h001?checkIn=…&adults=2" --> H1[Hotel]
        H1 -- "/booking/checkout?hotelId=…&roomId=…" --> B1[Booking]
    end
    subgraph B["2 - Shared store (the notice board)"]
        direction LR
        Hdr[Shell header] -- "setCurrency('INR')" --> St[(currencyStore)]
        St -- re-render --> P1[Prices in every MFE]
    end
    subgraph C["3 - Events (the PA system)"]
        direction LR
        Bk[Booking] -- "emit booking:created" --> Bus{{eventBus}}
        Bus --> T[Shell toast]
        Bus --> Tr[Account trips list refresh]
    end
```

| Channel          | Use it for                                         | Example                                          | Survives reload?          |
| ---------------- | -------------------------------------------------- | ------------------------------------------------ | ------------------------- |
| **URL params**   | "What page & what am I looking at?"                | dates, guests, filters, hotelId, roomId          | ✅ yes (and shareable)     |
| **Shared store** | Long-lived, app-wide state many MFEs read          | logged-in user, currency, wishlist               | ✅ yes (localStorage)      |
| **Event bus**    | "Something just happened" notifications            | booking created, toast message, user logged in   | ❌ no (fire-and-forget)    |

Rule of thumb: **if you can put it in the URL, put it in the URL.**

---

## 4. Journey walkthroughs

Each walkthrough follows one user action from click to screen.

### 4.1 Opening the site

```mermaid
sequenceDiagram
    autonumber
    actor U as Traveller
    participant B as Browser
    participant SH as Shell (:3000)
    participant SR as Search remote (:3001)
    participant AC as Account remote (:3004)

    U->>B: open http://localhost:3000/
    B->>SH: download index.html + shell JS
    SH->>SH: Module Federation runtime starts,<br/>registers shared React / Router / @mini-agoda/shared
    SH->>SR: GET remoteEntry.js (route "/" belongs to search)
    SH->>AC: GET remoteEntry.js (header needs UserMenu)
    SR-->>SH: HomePage component
    AC-->>SH: UserMenu component
    SH->>B: render header + HomePage + footer
```

**In plain words:** the shell loads first and draws the frame. It then asks
the search MFE for its home page and the account MFE for the user menu in the
header. Only the code for the current page is downloaded. The hotel and booking
code isn't fetched until you need it.

### 4.2 Searching for hotels

```mermaid
sequenceDiagram
    autonumber
    actor U as Traveller
    participant F as SearchForm (search MFE)
    participant R as Router (URL)
    participant P as SearchPage (search MFE)
    participant API as Mock API

    U->>F: type "Bang…"
    F->>API: searchDestinations("Bang") (debounced 200ms)
    API-->>F: [Bangkok, …]
    U->>F: pick Bangkok, dates, 2 adults → Search
    F->>F: saveRecentSearch() → localStorage
    F->>R: navigate /search?destination=Bangkok&checkIn=…&adults=2
    R->>P: render SearchPage
    P->>P: parseCriteria(URL) + parseFilters(URL)
    P->>API: searchHotels({destination, filters, sort, page})
    API-->>P: { hotels[10], total, totalPages, priceRange }
    U->>P: tick "5★" filter
    P->>R: update URL (?stars=5) - no page reload
    R->>P: URL changed → refetch with new filters
```

**In plain words:** the search form doesn't store results anywhere. It just
writes your choices into the URL. The results page reads the URL, asks the API,
and shows what comes back. Changing a filter changes the URL again, so the
page refreshes its results. Because of this, you can copy the link, reload, or
press Back and you'll still see the same results.

### 4.3 Viewing a hotel and picking a room

```mermaid
sequenceDiagram
    autonumber
    actor U as Traveller
    participant SP as SearchPage (search)
    participant SH as Shell router
    participant HP as HotelPage (hotel MFE)
    participant API as Mock API

    U->>SP: click "View deal"
    SP->>SH: navigate /hotel/h001?checkIn=…&checkOut=…&adults=2&rooms=1
    SH->>HP: lazy-load hotel remote (first time only) and render
    HP->>API: getHotel(h001)
    API-->>HP: hotel (page skeleton → real content)
    par each section fetches its own data
        HP->>API: getRooms(h001)
        HP->>API: getReviews(h001, page 1)
        HP->>API: getSimilarHotels(h001)
    end
    API-->>HP: rooms, reviews, similar
    U->>HP: change dates in StayBar → Update
    HP->>SH: replace URL query (no new history entry)
    U->>HP: click "Reserve" on Deluxe King
    HP->>SH: navigate /booking/checkout?hotelId=h001&roomId=h001-r3&checkIn=…
```

**In plain words:** the search MFE passes your dates and guests to the hotel MFE
in the link. The hotel MFE loads the hotel's own data from the API. When you
click *Reserve*, it builds another link for the booking MFE. **No MFE hands a
JavaScript object to another one.** Only URLs cross the boundary.

### 4.4 Checking out (the most important flow)

```mermaid
sequenceDiagram
    autonumber
    actor U as Traveller
    participant CO as CheckoutPage (booking MFE)
    participant ST as Shared store
    participant API as Mock API
    participant DB as localStorage
    participant BUS as Event bus
    participant SH as Shell Toaster
    participant TR as TripsPage (account)

    CO->>ST: useAuth() - is someone logged in?
    ST-->>CO: user (or null → guest checkout)
    CO->>API: getRoom(hotelId, roomId)
    API-->>CO: hotel + room (price comes from the API, never from the URL)
    CO->>CO: calculatePrice(nights, rooms, promo) → total
    U->>CO: fill guest details → Next
    U->>CO: enter card 4242… → Pay
    CO->>API: createBooking({...guest, payment, promoCode})
    API->>API: re-validate room, dates, pay-at-hotel and recompute price
    API->>DB: save booking under "mini-agoda:db:bookings"
    API->>BUS: emit("booking:created", booking)
    BUS-->>SH: show "Booking MA… confirmed 🎉"
    BUS-->>TR: (if mounted) refresh list
    API-->>CO: booking
    CO->>CO: navigate /booking/confirmation/MA…
```

**In plain words:**

1. The URL says *which* room and dates you want, but **the price always comes
   from the API**, so nobody can edit the price by changing the URL.
2. When you pay, the API checks everything again, saves the booking and
   announces *"a booking was created"*.
3. The shell hears the announcement and shows a toast. The account MFE hears it
   too and refreshes "My trips". The booking MFE doesn't need to know that
   either of them exists.

### 4.5 Logging in

```mermaid
sequenceDiagram
    autonumber
    actor U as Traveller
    participant LP as LoginPage (account MFE)
    participant API as Mock API
    participant ST as authStore (shared)
    participant UM as UserMenu (account, inside shell header)
    participant CO as Checkout form (booking)

    U->>LP: email + password → Sign in
    LP->>API: login(email, password)
    API-->>LP: User
    LP->>ST: setCurrentUser(user)
    ST->>ST: persist to localStorage "mini-agoda:auth"
    ST-->>UM: re-render → avatar "D ▾"
    ST-->>CO: next checkout pre-fills name, email, phone
    LP->>LP: navigate to ?redirect=… (e.g. back to checkout)
```

**In plain words:** logging in writes the user to the shared store. Every
component that reads the store (the header menu, the checkout form, the trips
page) updates automatically. Nobody has to send them a message.

### 4.6 Switching currency

```mermaid
flowchart LR
    A["User picks INR<br/>in shell header"] --> B["setCurrency('INR')"]
    B --> C[(currencyStore)]
    C --> D["&lt;Price&gt; in Search cards"]
    C --> E["&lt;Price&gt; in Hotel rooms"]
    C --> F["&lt;Money&gt; in Booking summary"]
    C --> G["&lt;Price&gt; in Account wishlist"]
```

All prices are stored in **USD**. The `<Price>` / `<Money>` components from the
shared package read the selected currency and convert while rendering. One
store update re-renders prices in all four MFEs.

### 4.7 Saving to wishlist

```mermaid
flowchart LR
    H["♡ clicked on a<br/>Search card"] --> T["toggleWishlist(id)"]
    T --> WS[(wishlistStore)]
    T --> EV{{"emit wishlist:changed"}}
    T --> TO{{"toast.info(...)"}}
    WS --> C1["Shell header ♡ counter"]
    WS --> C2["Hotel page heart"]
    WS --> C3["Account → Wishlist page"]
    TO --> SH["Shell Toaster"]
```

---

## 5. Who owns which data?

| Data                        | Owner (writes)    | Readers                          | Lives in                              |
| --------------------------- | ----------------- | -------------------------------- | ------------------------------------- |
| Hotels, rooms, reviews      | Mock API          | Search, Hotel, Booking, Account  | In-memory (generated, deterministic)  |
| Search criteria & filters   | Search MFE        | Search, Hotel, Booking (via URL) | URL query string                      |
| Recent searches             | Search MFE        | Search MFE                       | `localStorage: mini-agoda:search:recent` |
| Selected room & stay        | Hotel MFE         | Booking MFE                      | URL query string                      |
| Bookings                    | Mock API          | Booking, Account                 | `localStorage: mini-agoda:db:bookings` |
| Users (accounts)            | Mock API          | Account                          | `localStorage: mini-agoda:db:users`    |
| Current user (session)      | Account MFE       | Everyone                         | `authStore` → `mini-agoda:auth`        |
| Currency                    | Shell             | Everyone                         | `currencyStore` → `mini-agoda:currency` |
| Wishlist                    | Anyone (heart)    | Shell, Search, Hotel, Account    | `wishlistStore` → `mini-agoda:wishlist` |
| Toast messages              | Anyone            | Shell                            | Event only (not stored)               |

**Golden rule:** each piece of data has exactly **one writer**. Many MFEs
can read it.

---

## 6. What happens when something breaks?

```mermaid
flowchart TD
    A[Shell renders route] --> B{Remote reachable?}
    B -- yes --> C[Render remote page]
    B -- no / throws --> D["RemoteBoundary catches it"]
    D --> E["Show 'This section is temporarily unavailable' + Retry"]
    E -->|Retry| A
    C --> F{API call fails?}
    F -- yes --> G["ErrorState with Try again"]
    F -- no --> H[Show data]
```

- If the **booking server is down**, search and hotel pages keep working. Only
  `/booking/*` shows a friendly error card with a Retry button.
- If the **account server is down**, the header shows a plain "Sign in" link
  instead of the user menu, so the page still renders.
- Open the 🧩 button (bottom-left) or press **Ctrl+Shift+M** to see which
  remotes are loaded, loading or failed. You can also outline each MFE on the page.

---

## 7. Glossary

| Term                  | Meaning                                                                        |
| --------------------- | ------------------------------------------------------------------------------ |
| **Micro frontend (MFE)** | A slice of the UI owned, built and deployed by one team.                  |
| **Shell / host**      | The app the browser opens first. It composes the MFEs.                         |
| **Remote**            | An MFE that *exposes* components for the shell to load at runtime.            |
| **remoteEntry.js**    | The small "menu" file each remote publishes, listing what it exposes.          |
| **Module Federation** | The technology that lets one JS app load code from another at runtime.         |
| **Singleton (shared)** | A library loaded once and reused by every MFE (React, Router, our shared pkg). |
| **Event bus**         | A publish/subscribe channel on `window` for "something happened" messages.     |
| **Store**             | A small global state container. Changing it re-renders every subscriber.      |
