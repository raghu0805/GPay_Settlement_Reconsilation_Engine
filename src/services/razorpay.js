/**
 * Razorpay Test Mode Service for Google Pay Web App
 * Integrates Razorpay Checkout with graceful fallback for zero-cost testing.
 */

export function openRazorpayCheckout({
  amount = 1500,
  recipientName = 'GPay Recipient',
  note = 'Due Balance settlement',
  keyId,
  onSuccess,
  onFailure,
  onDismiss,
}) {
  const amountInPaise = Math.round(Number(amount) * 100);

  if (typeof window.Razorpay === 'undefined') {
    if (onFailure) onFailure('Razorpay Checkout SDK is loading. Please try again.');
    return;
  }

  // Use user-provided keyId, environment variable, or fallback test key
  const razorpayKey = keyId || (import.meta.env && import.meta.env.VITE_RAZORPAY_KEY_ID) || 'rzp_test_51234567890123';

  const options = {
    key: razorpayKey,
    amount: amountInPaise,
    currency: 'INR',
    name: 'Google Pay',
    description: note || `Paying ${recipientName}`,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Google_Pay_G_logo_%282020%29.svg/512px-Google_Pay_G_logo_%282020%29.svg.png',
    handler: function (response) {
      console.log('Razorpay Test Payment Success:', response);
      if (onSuccess) {
        onSuccess({
          paymentId: response.razorpay_payment_id || `pay_gpay_${Date.now()}`,
          orderId: response.razorpay_order_id || 'order_test_123',
          signature: response.razorpay_signature || 'sig_test_123',
          amount: Number(amount),
          recipientName,
        });
      }
    },
    prefill: {
      name: recipientName,
      email: 'melissa.mor@gmail.com',
      contact: '9876543210',
    },
    notes: {
      payment_type: 'GPay Web App Test Payment',
      recipient: recipientName,
    },
    theme: {
      color: '#1a73e8', // Google Pay blue
    },
    modal: {
      ondismiss: function () {
        console.log('Razorpay Checkout Modal Dismissed');
        if (onDismiss) onDismiss();
      },
    },
  };

  try {
    const razorpayInstance = new window.Razorpay(options);
    razorpayInstance.on('payment.failed', function (response) {
      console.warn('Razorpay Payment Failed or Invalid Key:', response.error);
      if (onFailure) onFailure(response.error ? response.error.description : 'Payment Failed');
    });
    razorpayInstance.open();
  } catch (err) {
    console.warn('Error launching Razorpay Checkout:', err);
    if (onFailure) onFailure(err.message);
  }
}
