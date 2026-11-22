"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addDoc, collection, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { db, getAuthInstance } from "@/lib/firebase";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { onAuthStateChanged } from "firebase/auth";
import type { Cliente } from "@/types";

const formSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  telefono: z.string().min(8, "El teléfono debe tener al menos 8 caracteres"),
  mensaje: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ClubJoinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ClubJoinModal({ isOpen, onClose }: ClubJoinModalProps) {
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen, mounted]);


  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (!isOpen) return;
    const auth = getAuthInstance();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const setIfEmpty = (field: keyof FormData, value?: string) => {
        const current = getValues(field);
        if (!current && value) {
          setValue(field, value);
        }
      };

      setIfEmpty("email", user.email || "");
      setIfEmpty("nombre", user.displayName || "");

      try {
        const ref = doc(db, "clientes", user.uid);
        const snapshot = await getDoc(ref);
        if (!snapshot.exists()) return;
        const cliente = snapshot.data() as Cliente;
        const fullName =
          cliente.nombreCompleto || [cliente.nombre, cliente.apellido].filter(Boolean).join(" ").trim();

        setIfEmpty("nombre", fullName);
        setIfEmpty("email", cliente.email);
        setIfEmpty("telefono", cliente.telefono);
      } catch (error) {
        console.error("Error loading cliente profile:", error);
      }
    });

    return () => unsubscribe();
  }, [isOpen, getValues, setValue]);

  const saveSignupFallback = async (data: FormData) => {
    await addDoc(collection(db, "club_lado_v"), {
      nombre: data.nombre.trim(),
      email: data.email.trim(),
      telefono: data.telefono.trim(),
      mensaje: data.mensaje?.trim() || "",
      status: "pending",
      source: "landing",
      createdAt: serverTimestamp(),
      fechaCreacion: serverTimestamp(),
      tipo: "club",
      leida: false,
      emailLower: data.email.trim().toLowerCase(),
    });
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const response = await fetch("/api/club/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "No pudimos registrar tu solicitud");
      }

      if (payload.result?.kind === "already_active") {
        toast.success("Ya sos parte del Club", {
          description: "Actualizamos tus datos para mantener tu perfil al día.",
        });
      } else if (payload.result?.kind === "updated") {
        toast.success("Solicitud actualizada", {
          description: "Ya teníamos tu email. Actualizamos tu registro sin duplicados.",
        });
      } else {
        toast.success("¡Solicitud enviada!", {
          description: "Recibirás tu confirmación por email.",
        });
      }

      reset();
      onClose();
    } catch (error) {
      console.error("Error al enviar solicitud:", error);
      try {
        await saveSignupFallback(data);
        toast.success("Solicitud enviada", {
          description: "Registramos tu solicitud correctamente. Te contactaremos pronto.",
        });
        reset();
        onClose();
      } catch (fallbackError) {
        console.error("Error fallback registro club:", fallbackError);
        toast.error("Error al enviar la solicitud", {
          description: "Por favor, intentá nuevamente.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            style={{ zIndex: 9999 }}
            onClick={onClose}
          />
          <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-gray-100 ring-1 ring-primary/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <div className="absolute inset-x-0 top-0 h-20 bg-linear-to-r from-primary/20 via-white to-secondary/15" />
                <div className="relative px-4 pt-4 pb-3 border-b border-gray-100">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                        <Sparkles className="h-3 w-3" />
                        Club Lado V
                      </p>
                      <h2 className="text-base font-semibold text-gray-900 mt-1">Sumate al Club Lado V</h2>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Completá tus datos y te contactamos.
                      </p>
                    </div>
                    <button
                      onClick={onClose}
                      className="cursor-pointer rounded-full border border-gray-200 p-1.5 text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors"
                      aria-label="Cerrar"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="px-4 pb-4 pt-3 space-y-3">
                  <div className="rounded-xl border border-gray-200 bg-white/90 p-3 shadow-sm">
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-700 mb-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Sparkles className="h-3 w-3" />
                      </span>
                      Datos para tu solicitud
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="col-span-2">
                        <Label className="text-[11px] font-semibold text-gray-900">Nombre completo *</Label>
                        <Input
                          id="nombre"
                          {...register("nombre")}
                          className={`mt-1.5 h-8 ${errors.nombre ? "border-red-500" : "border-gray-200"}`}
                          placeholder="Juan Pérez"
                          disabled={loading}
                        />
                        {errors.nombre && (
                          <p className="text-red-500 text-[11px] mt-1">{errors.nombre.message}</p>
                        )}
                      </div>
                      <div>
                        <Label className="text-[11px] font-semibold text-gray-900">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          {...register("email")}
                          className={`mt-1.5 h-8 ${errors.email ? "border-red-500" : "border-gray-200"}`}
                          placeholder="juan@ejemplo.com"
                          disabled={loading}
                        />
                        {errors.email && (
                          <p className="text-red-500 text-[11px] mt-1">{errors.email.message}</p>
                        )}
                      </div>
                      <div>
                        <Label className="text-[11px] font-semibold text-gray-900">Teléfono *</Label>
                        <Input
                          id="telefono"
                          type="tel"
                          {...register("telefono")}
                          className={`mt-1.5 h-8 ${errors.telefono ? "border-red-500" : "border-gray-200"}`}
                          placeholder="+54 11 1234-5678"
                          disabled={loading}
                        />
                        {errors.telefono && (
                          <p className="text-red-500 text-[11px] mt-1">{errors.telefono.message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white/90 p-3 shadow-sm">
                    <Label className="text-[11px] font-semibold text-gray-900">Mensaje (opcional)</Label>
                    <Textarea
                      id="mensaje"
                      {...register("mensaje")}
                      className="mt-1.5 min-h-[100px]"
                      placeholder="Contanos qué tipo de experiencias te interesan."
                      disabled={loading}
                    />
                  </div>

                  <div className="flex gap-3 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      disabled={loading}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-primary text-white hover:bg-primary/90"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Enviar
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  , document.body);
}
