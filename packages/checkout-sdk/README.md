# @beleqet/checkout-sdk

```ts
import { BeleqetPay } from '@beleqet/checkout-sdk';

const pay = new BeleqetPay({ publicKey: 'blq_live_...', apiBaseUrl: 'https://api.yourdomain.com' });

await pay.openCheckout({
  amount: '499.00',
  currency: 'ETB',
  customerEmail: 'buyer@example.com',
  successRedirectUrl: 'https://yourapp.com/checkout/success',
});
```
