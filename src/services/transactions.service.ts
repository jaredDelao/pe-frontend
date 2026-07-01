import api from "./http";
import { encryptAES } from "@/composables/useCrypto";
import type {
  OperacionSupervisorPayload,
  Transaccion,
  TransaccionResultado,
  VentaPayload,
} from "@/types";

export function venta(payload: VentaPayload) {
  const body = {
    amount: payload.amount,
    holderName: payload.holderName,
    cardNumber: encryptAES(payload.cardNumber),
    expiry: encryptAES(payload.expiry),
    cvv: encryptAES(payload.cvv),
  };
  return api.post<TransaccionResultado>("/venta", body);
}

export function listarTransacciones() {
  return api.get<Transaccion[]>("/transacciones");
}

export function cancelacion(payload: OperacionSupervisorPayload) {
  return api.patch<TransaccionResultado>("/cancelacion", payload, {
    successMessage: "Cancelación aplicada",
  });
}

export function devolucion(payload: OperacionSupervisorPayload) {
  return api.patch<TransaccionResultado>("/devolucion", payload, {
    successMessage: "Devolución aplicada",
  });
}
