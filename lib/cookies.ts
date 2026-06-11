"use client";

import Cookies from "js-cookie";

const COOKIE_KEYS = {
  LAST_ORDER_NUMBER: "lastOrderNumber",
  CHECKOUT_SESSION: "checkoutSession",
  PAYMENT_STATUS: "paymentStatus",
} as const;

const COOKIE_OPTIONS = {
  expires: 7, // 7 days
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};

export function setLastOrderNumber(orderNumber: string): void {
  Cookies.set(COOKIE_KEYS.LAST_ORDER_NUMBER, orderNumber, COOKIE_OPTIONS);
}

export function getLastOrderNumber(): string | undefined {
  return Cookies.get(COOKIE_KEYS.LAST_ORDER_NUMBER);
}

export function setCheckoutSession(sessionData: object): void {
  Cookies.set(
    COOKIE_KEYS.CHECKOUT_SESSION,
    JSON.stringify(sessionData),
    COOKIE_OPTIONS
  );
}

export function getCheckoutSession<T>(): T | null {
  const raw = Cookies.get(COOKIE_KEYS.CHECKOUT_SESSION);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setPaymentStatus(status: string): void {
  Cookies.set(COOKIE_KEYS.PAYMENT_STATUS, status, COOKIE_OPTIONS);
}

export function getPaymentStatus(): string | undefined {
  return Cookies.get(COOKIE_KEYS.PAYMENT_STATUS);
}

export function clearOrderCookies(): void {
  Cookies.remove(COOKIE_KEYS.LAST_ORDER_NUMBER);
  Cookies.remove(COOKIE_KEYS.CHECKOUT_SESSION);
  Cookies.remove(COOKIE_KEYS.PAYMENT_STATUS);
}
