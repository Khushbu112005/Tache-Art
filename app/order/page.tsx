import OrderForm from "@/components/OrderForm";

export default function OrderPage() {
    return (
        <div className="bg-[var(--tache-cream)] min-h-screen py-16 px-4 sm:px-6 lg:px-8">
            <div className="container mx-auto max-w-4xl">
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-5xl font-bold tracking-widest uppercase mb-4 text-black">Custom Request</h1>
                    <p className="text-gray-600 font-light max-w-xl mx-auto leading-relaxed">
                        Every commissioned piece is a collaborative journey. Share your vision below, and I will bring it to life on canvas.
                    </p>
                    <div className="h-px w-24 bg-[var(--tache-soft-brown)] mx-auto mt-8" />
                </div>

                <OrderForm />
            </div>
        </div>
    );
}
