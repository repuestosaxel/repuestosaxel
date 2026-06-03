"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Minus, PackagePlus, Plus, ShoppingCart, Trash2 } from "lucide-react";

import { FormSelect, FormSelectOption } from "@/components/stock/form-select";
import {
  ModalField,
  ModalPriceBlock,
  ModalSection,
  ProductModalShell
} from "@/components/stock/product-modal-shell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCrm } from "@/contexts/crm-context";
import { useInventory } from "@/contexts/inventory-context";
import {
  buildCartItem,
  getCartTotal,
  mergeCartItem,
  updateCartQuantity,
  useSaleOperations
} from "@/hooks/use-sale-operations";
import { cn, money } from "@/lib/utils";
import { PAYMENT_METHODS, type PaymentMethod, type SaleCartItem } from "@/types/sales";

type NewSaleDialogProps = {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialProductId?: string;
  onCompleted?: (saleId: string) => void;
};

export function NewSaleDialog({
  trigger,
  open: controlledOpen,
  onOpenChange,
  initialProductId,
  onCompleted
}: NewSaleDialogProps) {
  const { customers } = useCrm();
  const { getProductById } = useInventory();
  const { availableProducts, completeSale } = useSaleOperations();
  const [internalOpen, setInternalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<SaleCartItem[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Mercado Pago");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const prevOpenRef = useRef(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const isQuickSale = Boolean(initialProductId);

  const initialProduct = initialProductId ? getProductById(initialProductId) : undefined;

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    const pool = availableProducts.filter((product) => product.id !== initialProductId);

    if (!query) return pool;

    return pool.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.internalCode.toLowerCase().includes(query)
    );
  }, [availableProducts, search, initialProductId]);

  const cartTotal = getCartTotal(cart);
  const cartUnits = cart.reduce((sum, item) => sum + item.quantity, 0);

  const resetForm = () => {
    setSearch("");
    setCart([]);
    setCustomerId("");
    setPaymentMethod("Mercado Pago");
    setNotes("");
    setError(null);
    setCatalogOpen(false);
  };

  const addProductToCart = (productId: string, mergeExisting = true) => {
    const product = getProductById(productId);
    if (!product || product.stock <= 0) return false;

    const item = buildCartItem(product);
    setCart((current) => (mergeExisting ? mergeCartItem(current, item) : [...current, item]));
    setError(null);
    return true;
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (isControlled) {
      onOpenChange?.(nextOpen);
    } else {
      setInternalOpen(nextOpen);
    }
  };

  useEffect(() => {
    const justOpened = open && !prevOpenRef.current;
    prevOpenRef.current = open;

    if (!open) {
      resetForm();
      return;
    }

    if (justOpened && initialProductId) {
      addProductToCart(initialProductId);
      setCatalogOpen(false);
    } else if (justOpened && !initialProductId) {
      setCatalogOpen(true);
    }
  }, [open, initialProductId]);

  const handleAddProduct = (productId: string) => {
    addProductToCart(productId);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setError("Agregá al menos un producto al carrito.");
      return;
    }

    setProcessing(true);
    const result = await completeSale(cart, {
      customerId: customerId || undefined,
      paymentMethod,
      notes: notes || undefined,
      status: "Pagado"
    });
    setProcessing(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    onCompleted?.(result.saleId);
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      {!trigger && !isControlled ? (
        <DialogTrigger asChild>
          <Button>
            <ShoppingCart /> Nueva venta
          </Button>
        </DialogTrigger>
      ) : null}

      <ProductModalShell
        title={isQuickSale && initialProduct ? `Vender · ${initialProduct.name}` : "Nueva venta"}
        description={
          isQuickSale
            ? "El producto ya está en el carrito. Ajustá cantidad, cliente y pago para confirmar."
            : "POS integrado con inventario. El stock se descuenta al confirmar."
        }
        sidebar={
          <>
            <div className="rounded-2xl border border-racing-red/25 bg-racing-red/10 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">Total</p>
              <p className="mt-2 font-display text-3xl font-black text-white">{money(cartTotal)}</p>
              <p className="mt-1 text-sm text-white/58">
                {cartUnits} unidad{cartUnits === 1 ? "" : "es"} · {cart.length} producto
                {cart.length === 1 ? "" : "s"}
              </p>
            </div>

            <ModalField label="Cliente (opcional)" className="mt-4">
              <FormSelect value={customerId} onChange={(event) => setCustomerId(event.target.value)}>
                <FormSelectOption value="">Mostrador — sin cliente</FormSelectOption>
                {customers.map((customer) => (
                  <FormSelectOption key={customer.id} value={customer.id}>
                    {customer.name}
                  </FormSelectOption>
                ))}
              </FormSelect>
            </ModalField>

            <ModalField label="Método de pago" className="mt-3">
              <FormSelect
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
              >
                {PAYMENT_METHODS.map((method) => (
                  <FormSelectOption key={method} value={method}>
                    {method}
                  </FormSelectOption>
                ))}
              </FormSelect>
            </ModalField>

            <ModalField label="Notas" className="mt-3">
              <Textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Observaciones de la venta..."
                rows={3}
              />
            </ModalField>
          </>
        }
        footer={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <ModalPriceBlock label="Total a cobrar" value={money(cartTotal)} tone="accent" />
            <Button disabled={processing || cart.length === 0} onClick={handleCheckout}>
              <ShoppingCart />
              Confirmar venta
            </Button>
          </div>
        }
      >
        <ModalSection
          title="Carrito"
          action={
            cart.length > 0 ? (
              <span className="text-xs font-semibold text-white/42">{cart.length} ítem(s)</span>
            ) : null
          }
        >
          {cart.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-white/42">
              <PackagePlus className="mx-auto mb-2 size-5 text-white/30" />
              {isQuickSale
                ? "No se pudo cargar el producto. Verificá que tenga stock disponible."
                : "Agregá productos desde el catálogo."}
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.productId}
                  className={cn(
                    "rounded-2xl border p-4",
                    item.productId === initialProductId
                      ? "border-racing-red/35 bg-racing-red/10"
                      : "border-white/10 bg-white/[0.03]"
                  )}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-white">{item.productName}</p>
                      <p className="text-xs text-racing-red">{item.internalCode}</p>
                      <p className="mt-1 text-sm text-white/48">
                        {money(item.unitPrice)} c/u · máx. {item.stock} u.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="Disminuir cantidad"
                        className="flex size-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/70 transition-colors hover:border-white/20"
                        onClick={() =>
                          setCart((current) =>
                            updateCartQuantity(current, item.productId, item.quantity - 1)
                          )
                        }
                      >
                        <Minus className="size-4" />
                      </button>
                      <Input
                        className="w-16 text-center"
                        type="number"
                        min={1}
                        max={item.stock}
                        value={item.quantity}
                        onChange={(event) =>
                          setCart((current) =>
                            updateCartQuantity(
                              current,
                              item.productId,
                              Number(event.target.value)
                            )
                          )
                        }
                      />
                      <button
                        type="button"
                        aria-label="Aumentar cantidad"
                        className="flex size-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/70 transition-colors hover:border-white/20"
                        onClick={() =>
                          setCart((current) =>
                            updateCartQuantity(current, item.productId, item.quantity + 1)
                          )
                        }
                      >
                        <Plus className="size-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="Quitar producto"
                        className="flex size-9 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-200 transition-colors hover:border-red-500/35"
                        onClick={() =>
                          setCart((current) =>
                            current.filter((entry) => entry.productId !== item.productId)
                          )
                        }
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 flex justify-between border-t border-white/8 pt-3 text-sm">
                    <span className="text-white/45">Subtotal</span>
                    <span className="font-semibold text-white">
                      {money(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ModalSection>

        <ModalSection title="Catálogo">
          <button
            type="button"
            onClick={() => setCatalogOpen((current) => !current)}
            className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-sm font-semibold text-white/72 transition-colors hover:border-racing-red/30"
          >
            {isQuickSale ? "Agregar más productos al carrito" : "Buscar productos disponibles"}
            <ChevronDown
              className={cn("size-4 transition-transform", catalogOpen ? "rotate-180" : "")}
            />
          </button>

          {catalogOpen ? (
            <div className="mt-4 space-y-4">
              <Input
                placeholder="Buscar por nombre o código interno..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />

              <div className="grid gap-3 sm:grid-cols-2">
                {filteredProducts.length === 0 ? (
                  <div className="sm:col-span-2 rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-white/42">
                    No hay más productos con stock disponible.
                  </div>
                ) : (
                  filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => handleAddProduct(product.id)}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition-all hover:border-racing-red/35 hover:bg-white/[0.05]"
                    >
                      <p className="font-display font-bold text-white">{product.name}</p>
                      <p className="mt-1 text-xs text-racing-red">{product.internalCode}</p>
                      <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                        <span className="font-semibold text-white">{money(product.publicPrice)}</span>
                        <span className="text-white/42">Stock {product.stock}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          ) : null}
        </ModalSection>

        {error ? (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        ) : null}
      </ProductModalShell>
    </Dialog>
  );
}
