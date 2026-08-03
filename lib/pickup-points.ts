// Точки выдачи заказов. Единый источник данных для оформления заказа,
// письма и админки — чтобы адреса и время не расходились между страницами.
export type PickupPoint = {
  id: string;
  city: string;
  address: string;
  timeFrom: string;
  timeTo: string;
};

export const PICKUP_POINTS: PickupPoint[] = [
  { id: "baryshiha-18", city: "г. Москва", address: "ул. Барышиха, д. 18", timeFrom: "09:00", timeTo: "09:30" },
  { id: "zhukova-14k1", city: "г. Москва", address: "пр-кт Маршала Жукова, д. 14, к. 1", timeFrom: "10:00", timeTo: "10:30" },
  { id: "festivalnaya-8", city: "г. Москва", address: "ул. Фестивальная, д. 8", timeFrom: "11:00", timeTo: "11:30" },
  { id: "fonvizina-5", city: "г. Москва", address: "ул. Фонвизина, д. 5", timeFrom: "12:30", timeTo: "13:00" },
  { id: "sirenevy-75", city: "г. Москва", address: "Сиреневый Бульвар, д. 75", timeFrom: "14:00", timeTo: "14:30" },
  { id: "novokosinskaya-23", city: "г. Москва", address: "ул. Новокосинская, д. 23", timeFrom: "15:15", timeTo: "15:45" },
];

/** Строка для сохранения в заказе и отправки в письме/чеке. */
export function formatPickupPoint(point: PickupPoint): string {
  return `${point.city}, ${point.address} (выдача с ${point.timeFrom} до ${point.timeTo})`;
}

/** Ссылка на Яндекс.Карты с поиском по адресу точки. */
export function pickupMapUrl(point: PickupPoint): string {
  const query = encodeURIComponent(`${point.city}, ${point.address}`);
  return `https://yandex.ru/maps/?text=${query}`;
}
