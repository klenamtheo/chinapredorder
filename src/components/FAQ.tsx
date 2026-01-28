"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FAQItem {
    question: string;
    answer: string;
}

const faqs: FAQItem[] = [
    {
        question: "How does pre-ordering work?",
        answer: "You browse our catalog of products available from China. Once you place an order and make a payment, we consolidate orders and ship them to Ghana. The entire process takes about 2-3 weeks.",
    },
    {
        question: "What are the payment options?",
        answer: "We accept secure payments via Mobile Money (MTN, Vodafone, AirtelTigo) and Credit/Debit Cards.",
    },
    {
        question: "How can I track my order?",
        answer: "Once your order is confirmed, you will receive a tracking number. You can use this number on our 'Track Order' page to see real-time updates on your shipment.",
    },
    {
        question: "Do you offer refunds?",
        answer: "Yes, if your product arrives damaged or is not as described, you can request a refund within 7 days of delivery.",
    },
];

export function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="w-full py-12 md:py-24 bg-background">
            <div className="container px-4 md:px-6 mx-auto max-w-3xl">
                <div className="flex flex-col items-center space-y-4 text-center mb-16">
                    <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
                        Frequently Asked <span className="text-primary">Questions</span>
                    </h2>
                    <p className="text-muted-foreground md:text-lg max-w-2xl font-medium">
                        Find answers to common questions about our pre-order service and delivery process.
                    </p>
                </div>
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className={`border rounded-xl overflow-hidden transition-all duration-200 ${openIndex === index
                                    ? "border-primary ring-1 ring-primary/20"
                                    : "border-border hover:border-primary/50"
                                }`}
                        >
                            <button
                                onClick={() => toggleFAQ(index)}
                                className={`flex items-center justify-between w-full p-5 text-left font-bold transition-colors focus:outline-none ${openIndex === index ? "bg-primary/10 text-primary" : "bg-card text-foreground hover:bg-muted/50"
                                    }`}
                            >
                                <span>{faq.question}</span>
                                {openIndex === index ? (
                                    <ChevronUp className="h-5 w-5" />
                                ) : (
                                    <ChevronDown className="h-5 w-5" />
                                )}
                            </button>
                            {openIndex === index && (
                                <div className="p-5 bg-card/50 text-muted-foreground border-t border-border leading-relaxed font-medium">
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
