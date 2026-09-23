# Automation Ideas

## Search coverage

- Verify homepage catalogue navigation is visible and usable for key Skoda models.
- Verify keyword search returns relevant results for common spare parts such as oil filter.
- Verify model/category navigation filters or routes the user into the expected catalogue area.
- Verify no-result search states are handled gracefully without application errors.
- Verify search results expose enough product information for selection: product name, price, stock or code.

## Cart and checkout coverage

- Verify a product can be opened from search results.
- Verify a product can be added to cart from the product details page.
- Verify cart review shows quantity, total price, and a clear continue-to-checkout action.
- Verify checkout can be started without placing a real order.
- Verify required customer/contact fields validate before final order submission.

## Risk-based priority

- Search is the primary discovery path, so broken search can block conversion early.
- Cart and checkout are revenue-critical and should be treated as severity 0/1 flows.
- No-result and validation states reduce support burden and prevent confusing dead ends.
- The suite intentionally stops before final order submission to avoid creating real orders on a public production website.
