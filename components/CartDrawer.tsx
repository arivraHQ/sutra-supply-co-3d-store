"use client";

import { useEffect, useRef, useState } from "react";
import { BRAND, formatINR, getColorName } from "@/content/site";
import { useCartStore } from "@/store/cart";

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, clearCart } =
    useCartStore();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [customerName, setCustomerName] = useState("");
  const [pincode, setPincode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  const subtotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  const hasCustomImage = items.some((i) => i.printSpec?.mode === "image");

  function handleCheckout() {
    if (items.length === 0) return;
    if (!customerName.trim() || !/^\d{6}$/.test(pincode.trim())) {
      setErrorMsg("Enter your name and a valid 6-digit Indian pincode.");
      return;
    }
    setErrorMsg("");

    const lines = items.map((item, idx) => {
      const printDesc =
        item.printSpec && item.printSpec.mode !== "none"
          ? ` | Print: ${item.printSpec.placement.replace("-", " ")} (${
              item.printSpec.mode === "text"
                ? `Text "${item.printSpec.text}"`
                : `Logo file: ${item.printSpec.imageName}`
            })`
          : "";
      return `${idx + 1}. ${item.name} — ${getColorName(item.color)}, Size ${item.size}, Qty ${item.quantity}${printDesc} — ${formatINR(item.unitPrice * item.quantity)}`;
    });

    const message = [
      `Hi ${BRAND.name}, I'd like to place an order:`,
      "",
      ...lines,
      "",
      `Total: ${formatINR(subtotal)}`,
      `Name: ${customerName.trim()}`,
      `Delivery Pincode: ${pincode.trim()}`,
      hasCustomImage
        ? "(I will attach my artwork file right here in chat.)"
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    const url = `https://wa.me/${BRAND.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="cart-drawer-title"
      onCancel={(e) => {
        e.preventDefault();
        closeCart();
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current) {
          closeCart();
        }
      }}
      className="sutra-dialog"
    >
      <div className="ml-auto flex h-full w-full max-w-md flex-col border-l-[1.5px] border-[var(--ink)] bg-[var(--bg)] text-[var(--ink)]">
        <div className="flex items-center justify-between border-b-[1.5px] border-[var(--ink)] px-5 py-4">
          <div>
            <p className="font-mono-label text-[var(--ink)]/70">Order Bag</p>
            <h1 id="cart-drawer-title" className="font-display text-2xl">
              Your Rail ({items.reduce((s, i) => s + i.quantity, 0)})
            </h1>
          </div>
          <button
            type="button"
            onClick={closeCart}
            autoFocus
            className="inline-flex min-h-[44px] items-center border-[1.5px] border-[var(--ink)] bg-[var(--bg)] px-4 font-mono-label text-[var(--ink)] cursor-pointer hover:bg-[var(--ink)] hover:text-[var(--bg)]"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-start justify-center gap-3 py-12">
              <p className="font-mono-label text-[var(--ink)]/75">
                00 // Empty Rack
              </p>
              <p className="text-base text-[var(--ink)]">
                Pull a tee off the rail or customise one in the studio to build
                your WhatsApp order.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {items.map((item) => (
                <li
                  key={item.key}
                  className="flex gap-3 border-[1.5px] border-[var(--ink)] bg-[var(--bg)] p-3"
                >
                  <div className="flex h-20 w-16 shrink-0 items-center justify-center border-[1.5px] border-[var(--ink)] bg-[#DED9CE]">
                    {item.thumbnailDataUrl ? (
                      <img
                        src={item.thumbnailDataUrl}
                        alt={`${item.name} preview`}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <span className="font-mono-label text-[10px]">TEE</span>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold leading-tight text-[var(--ink)]">
                          {item.name}
                        </p>
                        <p className="mt-1 font-mono-label text-[11px] text-[var(--ink)]/75">
                          {getColorName(item.color)} / {item.size}
                        </p>
                        {item.printSpec && item.printSpec.mode !== "none" && (
                          <p className="mt-0.5 font-mono-label text-[11px] text-[var(--ink)]">
                            + Print: {item.printSpec.placement.replace("-", " ")}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.key)}
                        aria-label={`Remove ${item.name}`}
                        className="min-h-[32px] px-1.5 font-mono-label text-[11px] text-[var(--ink)]/75 underline cursor-pointer hover:text-[var(--accent)]"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="inline-flex items-center border-[1.5px] border-[var(--ink)]">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.key, item.quantity - 1)
                          }
                          aria-label={`Decrease quantity of ${item.name}`}
                          className="min-h-[32px] min-w-[32px] font-mono-label cursor-pointer hover:bg-[var(--ink)] hover:text-[var(--bg)]"
                        >
                          -
                        </button>
                        <span className="min-w-[2rem] text-center font-mono-label">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.key, item.quantity + 1)
                          }
                          aria-label={`Increase quantity of ${item.name}`}
                          className="min-h-[32px] min-w-[32px] font-mono-label cursor-pointer hover:bg-[var(--ink)] hover:text-[var(--bg)]"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-mono-label text-[var(--ink)]">
                        {formatINR(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t-[1.5px] border-[var(--ink)] bg-[var(--bg)] p-5">
            {hasCustomImage && (
              <p className="mb-3 border-[1.5px] border-[var(--ink)] bg-[#F1EDE4] p-2.5 font-mono-label text-[11px] leading-relaxed text-[var(--ink)]">
                Your design file is sent in the WhatsApp chat after you tap
                Order.
              </p>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="cart-name"
                  className="mb-1 block font-mono-label text-[11px]"
                >
                  Name
                </label>
                <input
                  id="cart-name"
                  type="text"
                  autoComplete="name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Aarav Verma"
                  className="min-h-[42px] w-full border-[1.5px] border-[var(--ink)] bg-[var(--bg)] px-2.5 text-sm text-[var(--ink)]"
                />
              </div>
              <div>
                <label
                  htmlFor="cart-pincode"
                  className="mb-1 block font-mono-label text-[11px]"
                >
                  Pincode
                </label>
                <input
                  id="cart-pincode"
                  type="text"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="208012"
                  className="min-h-[42px] w-full border-[1.5px] border-[var(--ink)] bg-[var(--bg)] px-2.5 text-sm text-[var(--ink)]"
                />
              </div>
            </div>

            {errorMsg && (
              <p
                role="alert"
                className="mt-2 font-mono-label text-[11px] text-[#A2240A]"
              >
                {errorMsg}
              </p>
            )}

            <div className="mt-4 flex items-center justify-between border-t-[1.5px] border-[var(--ink)] pt-3">
              <span className="font-mono-label">Subtotal</span>
              <span className="font-display text-xl">
                {formatINR(subtotal)}
              </span>
            </div>

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={handleCheckout}
                className="btn-ink flex-1"
              >
                Checkout on WhatsApp
              </button>
              <button
                type="button"
                onClick={clearCart}
                className="btn-outline"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>
    </dialog>
  );
}
