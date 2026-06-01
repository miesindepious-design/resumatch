import { lemonSqueezySetup, createCheckout as lsCreateCheckout } from '@lemonsqueezy/lemonsqueezy.js';

lemonSqueezySetup({
  apiKey: process.env.LEMONSQUEEZY_API_KEY!,
});

export async function createCheckout(userId: string, email: string) {
  const storeId = process.env.LEMONSQUEEZY_STORE_ID!;
  const variantId = process.env.LEMONSQUEEZY_VARIANT_ID!;

  const checkout = await lsCreateCheckout({
    storeId: storeId as unknown as number,
    variantId: variantId as unknown as number,
    checkoutOptions: {
      embed: false,
      media: true,
      logo: true,
    },
    checkoutData: {
      email: email,
      custom: {
        user_id: userId,
      },
    },
    productOptions: {
      enabledVariants: [parseInt(variantId)],
    },
    redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
  });

  return checkout.data.data.attributes.url;
}
