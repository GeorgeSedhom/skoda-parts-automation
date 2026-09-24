# Skoda Parts Exploratory Analysis

**Application:** [skoda-parts.com](https://www.skoda-parts.com)  
**Primary scope:** Search and Checkout  
**Test date:** 24 September 2026  
**Prepared by:** George Sedhom

## Session Objective

Perform a rapid, risk-based exploration of the Search and Checkout features. The goal was to reveal risks, ambiguities, usability concerns, and unexpected behavior rather than claim complete functional coverage.

## Exploratory Charters

### Charter 1: Search Feature

- **What:** Explore product search behavior across valid, empty, unmatched, malformed, URL-like, and special-character queries while changing vehicle context.
- **Why:** Search is a primary product-discovery path. Incorrect routing, misleading results, or lost vehicle context can prevent users from finding compatible parts.
- **How:** Vary query type and length, submit through keyboard and button actions, inspect results and generated URLs, navigate back and forward, and observe error recovery and context retention.
- **Stopping condition:** Stop after representative positive, negative, boundary, and malformed-input paths have been exercised and no new risk category appears.

### Charter 2: Checkout Feature

- **What:** Explore the journey from product selection through add to cart, quantity changes, empty-cart recovery, checkout transition, and hosted card payment.
- **Why:** Checkout directly affects conversion and payment confidence. Broken recovery, ambiguous actions, or unclear payment fields can cause abandonment.
- **How:** Add and remove products, update quantities, compare totals, exercise cart navigation, continue to checkout, and inspect payment labels, validation, and recovery without completing a real charge.
- **Stopping condition:** Stop after normal, empty-cart, quantity-update, navigation, invalid-input, and payment-form usability paths have been covered.

### Additional Time-Boxed Exploration

Mobile navigation, registration validation, My Garage phone verification, and catalogue content were sampled after the primary charters. These observations are retained because they expose meaningful user or security risks, but they are secondary to Search and Checkout.

## Prioritization Rationale

Checkout was explored first because it is the highest-value business path and failures close to purchase can directly cause abandonment. Empty-cart recovery and payment clarity received early attention because they can block progress entirely.

Search followed because it is the main route into product discovery, and malformed-input handling can expose routing and validation weaknesses. Security-sensitive registration behavior was prioritized above cosmetic catalogue and visual-hierarchy concerns. Within each area, blocking and misleading behavior was investigated before consistency and presentation improvements.

## Observation Summary

| ID | Area | Observation | Classification | Severity | Priority |
|---|---|---|---|---|---|
| BUG-001 | Checkout | Empty-cart **Back** control does not navigate | Bug | Medium | Medium |
| BUG-002 | Checkout | Empty-cart **Continue shopping** control does not navigate | Bug | Medium | High |
| BUG-003 | Mobile | Navigation and search controls interrupt catalogue content | Bug | Medium | High |
| BUG-004 | Registration | Email clear control cannot be activated after existing-email validation | Bug | Medium | High |
| BUG-005 | Registration | A one-character password is accepted | Security bug | High | High |
| BUG-006 | My Garage | Invalid phone number redirects to an unclear error page | Bug | Medium | High |
| BUG-007 | Catalogue | Product images are missing from multiple rows | Bug | Medium | Medium |
| BUG-008 | Catalogue | Availability status is absent from some rows | Bug | Medium | High |
| BUG-009 | Checkout | Required expiry and CVV inputs are not clearly presented | Bug | High | High |
| BUG-010 | Search | Full URL query generates an invalid route and a 404 response | Bug | Medium | High |
| ENH-001 | Catalogue | Add products directly from suitable listing rows | Enhancement | N/A | Medium |
| ENH-002 | UX | Improve first-view hierarchy and shopping-flow clarity | Enhancement | N/A | High |
| ENH-003 | Checkout | Rename **Buy** to **Add to cart** and clarify next actions | Enhancement | N/A | High |
| ENH-004 | Checkout | Disable or restyle the cart link on the current cart page | Enhancement | N/A | Low |

## Primary Charter Findings

### BUG-001: Empty-Cart Back Control Does Not Navigate

**Steps:** Add a product, open the cart, remove the final product, and select **Back**.  
**Expected:** Return to the previous shopping context or a defined catalogue page.  
**Actual:** The empty-cart page remains displayed.  
**Risk:** The cart feels like a dead end and interrupts recovery.

### BUG-002: Continue Shopping Does Not Navigate

**Steps:** Add a product, remove the final cart item, and select **Continue shopping**.  
**Expected:** Open the store or an appropriate catalogue page.  
**Actual:** The user remains on the cart page.  
**Risk:** The primary recovery action fails and may cause abandonment.

### BUG-009: Required Payment Fields Are Not Clearly Presented

**Steps:** Continue to hosted card payment and identify fields for card number, expiry date, CVV, and cardholder name. Trigger validation without completing a charge.  
**Expected:** Each required value has a visible label, associated input, and field-level validation. If cardholder name is not required, the flow does not imply that it is missing.  
**Actual:** Validation requests card validity and a three-digit security code without clearly visible, labelled inputs for those values. The cardholder-name requirement is unclear.  
**Risk:** Users may be unable or unwilling to complete payment. Review is required with the external payment provider.

### BUG-010: Full URL Search Input Produces a 404 Route

**Input:** `https://www.skoda-parts.com/contact.html`  
**Steps:** Paste the URL into product search and select **Search**.  
**Expected:** Remain on a valid results page with a safe no-results response, or show clear input validation.  
**Actual:** The URL is encoded into a product path, an additional `.html` suffix is appended, and the user reaches a 404 page.  
**Risk:** Unexpected input breaks the search journey and indicates fragile route construction.

## Additional Findings

### BUG-003: Mobile Navigation Placement

On a narrow viewport, the logo and search, cart, and menu controls appear between vehicle-model rows. Navigation should remain in a clearly defined header or intentional sticky region.

### BUG-004: Email Clear Control

After an already-registered email error appears, the visible `X` control cannot clear the email. Manual text selection is the only observed workaround.

### BUG-005: One-Character Password Accepted

Registration succeeds with a one-character password. An approved password policy should be communicated and enforced on both client and server. Boundary and direct-request testing are required.

### BUG-006: Invalid Phone Validation Loses Context

Submitting a single-digit phone number redirects away from the entry form and displays a message combining SMS failure with the one-garage-space rule. The user should remain on the form with specific inline validation and the entered value preserved.

### BUG-007: Missing Product Images

Multiple catalogue rows show a generic camera placeholder instead of a product image. Product-image mappings and asset responses should be reviewed, with a deliberate accessible fallback where no image exists.

### BUG-008: Missing Availability Status

Some catalogue rows show neither **IN STOCK** nor an explicit alternative such as **OUT OF STOCK** or **Available to order**. Every row should expose an accurate state derived from inventory data.

## Usability Enhancements

### ENH-001: Add to Cart From Product Listings

Provide **Add to cart** on suitable product rows using the default quantity. Products requiring compatibility, variant, or mandatory-option decisions should continue to open their details page.

### ENH-002: Improve First-View Clarity

Strengthen visual hierarchy, group related controls, reduce density, and make the progression from vehicle selection to category, product, cart, and checkout easier to recognize.

### ENH-003: Clarify Add-to-Cart and Checkout Actions

Rename **Buy** to **Add to cart** because the immediate action does not purchase the item. After addition, show distinct **View cart** and **Checkout** options, keep the cart count persistent, and make transient confirmation accessible and readable.

### ENH-004: Restyle the Cart Link on the Cart Page

When the user is already on the cart page, present the cart summary as the active section rather than a link that reloads the same page. Retain **Update cart** for applying quantity changes.

## Risks and Ambiguities

- The precise intended destinations of **Back** and **Continue shopping** require product confirmation.
- The configured payment provider may intentionally omit cardholder name; this should be confirmed rather than assumed defective.
- Missing availability labels require comparison with authoritative inventory data before concluding that products are out of stock.
- Password requirements are not visibly communicated, so the intended security policy is unknown.
- Some observations were reproduced once and should be confirmed across browsers, viewports, entry paths, and clean sessions.

## Recommended Follow-Up

1. Reproduce all High-priority findings and capture browser, viewport, account state, and network evidence.
2. Confirm the empty-cart navigation contract and add regression coverage for both recovery controls.
3. Validate URL-like, reserved-character, long, empty, and Unicode search queries at UI and API layers.
4. Review hosted payment fields and accessibility with the payment provider.
5. Enforce password policy server-side and test boundary values and direct requests.
6. Audit product image mappings and expose a defined availability state on every catalogue row.
7. Retest primary Search and Checkout paths in Edge, Chrome, Firefox, and representative mobile viewports.

## Coverage Limitation

This was a time-boxed exploratory session, not exhaustive verification. No real payment was completed, production data was not modified beyond normal test-account and cart activity, and findings should be reproduced before release decisions are made.
