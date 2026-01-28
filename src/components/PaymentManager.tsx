"use client";

import { forwardRef, useImperativeHandle } from "react";
import { usePaystackPayment } from "react-paystack";

interface PaymentManagerProps {
    config: any;
}

const PaymentManager = forwardRef((props: PaymentManagerProps, ref) => {
    const initializePayment = usePaystackPayment(props.config);

    useImperativeHandle(ref, () => ({
        triggerPayment: (callbacks: { onSuccess: (reference: any) => void, onClose: () => void }) => {
            initializePayment({
                onSuccess: callbacks.onSuccess,
                onClose: callbacks.onClose,
            });
        }
    }));

    return null;
});

PaymentManager.displayName = "PaymentManager";

export default PaymentManager;
