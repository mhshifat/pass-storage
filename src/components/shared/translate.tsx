"use client";

import { HTMLAttributes, PropsWithChildren, createElement } from "react";
import { useTranslation } from "react-i18next";

interface TranslateProps extends HTMLAttributes<HTMLElement> {
  as?: "h3" | "p" | "span";
}

export default function Translate({ as, children, ...props }: PropsWithChildren<TranslateProps>) {
  const { t } = useTranslation();

  if (!as) return (
    <>
      {t(`translations.${children}`)}
    </>
  )
  return createElement(as, props, t(`translations.${children}`))
}
