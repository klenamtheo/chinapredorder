"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FAQItem {
    question: string;
    answer: string;
}

const faqs: FAQItem[] = [
    {
        question: "How does Nocta work?",
        answer: "Nocta is a premium digital store based in Ghana. You can browse our curated selection of fashion and accessories, place your order, and have it delivered directly to your location in real-time.",
    },
    {
        question: "What are the payment options?",
        answer: "We accept secure payments via Mobile Money (MTN, Telecel, AT) and Credit/Debit Cards. All transactions are handled securely.",
    },
    {
        question: "How long does delivery take?",
        answer: "Since we are based locally in Ghana, delivery typically takes 1-3 business days depending on your location.",
    },
    {
        question: "How can I track my order?",
        answer: "Once your order is confirmed, you will receive a tracking number. You can use this number on our 'Track Order' page to see the real-time status of your delivery.",
    },
    {
        question: "Do you offer refunds?",
        answer: "Yes, if your product arrives damaged or is not as described, you can request a refund or exchange within 7 days of delivery.",
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
                        Find answers to common questions about our products, payments, and local delivery process.
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
