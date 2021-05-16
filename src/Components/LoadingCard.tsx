import { Card, Spinner } from "react-bootstrap";
import { Trans, useTranslation } from "react-i18next";

export default function LoadingCard() {
  const { t, ready } = useTranslation("ui", { useSuspense: false });
  return <Card bg="darkcontent" text={"lightfont" as any} className="mt-2">
    <Card.Body>
      <h3 className="text-center">{ready ? <Trans t={t} i18nKey="ui:loading" /> : "Loading..."}<Spinner animation="border" variant="primary" /></h3>
    </Card.Body>
  </Card>
}