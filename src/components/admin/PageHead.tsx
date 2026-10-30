import React from "react";

interface PageHeadProps {
  title: string;
  lede?: string;
  action?: React.ReactNode;
}

export default function PageHead({ title, lede, action }: PageHeadProps) {
  return (
    <div className="adm-page-head">
      <div>
        <h1 className="adm-h1">{title}</h1>
        {lede && <p className="adm-lede">{lede}</p>}
      </div>
      {action}
    </div>
  );
}
