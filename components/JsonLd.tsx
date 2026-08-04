/** Вставка JSON-LD в SSR-разметку (Том 5, п. 5.3; факт должен быть в HTML) */
export default function JsonLd({ data }: { data: object | object[] }) {
  const json = JSON.stringify(data);
  return (
    <script
      type="application/ld+json"
      // JSON.stringify экранирует кавычки; данные наши, не пользовательские
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
