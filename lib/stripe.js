import Stripe from "stripe";

// Constructing Stripe with a missing/empty key throws immediately, which
// would crash any page that imports this module before checkout even runs —
// stay null until a key is configured, and let callers surface a clear error.
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export default stripe;
