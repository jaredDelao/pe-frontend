export type Role = 'Supervisor' | 'Operador'

export interface JwtPayload {
  Role?: Role
  role?: Role
  sub?: string
  name?: string
  exp?: number
  [key: string]: unknown
}

export interface LoginResponse {
  token: string
}

export interface VentaPayload {
  amount: number
  holderName: string
  cardNumber: string
  expiry: string
  cvv: string
}

export interface TransaccionResultado {
  approvalNumber: string
  financialReference: string
  maskedCard: string
  amount: number
  status: string
}

export interface OperacionSupervisorPayload {
  financialReference: string
  cardNumber: string
  transactionNumber?: string
}

export type EstatusTransaccion = 'APROBADA' | 'CANCELADA' | 'DEVUELTA' | 'RECHAZADA'

export interface Transaccion {
  id: string
  approvalNumber: string
  financialReference: string
  
  maskedCard: string
  amount: number
  holder: string
  date: string

  status: EstatusTransaccion
}

export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'unknown'
