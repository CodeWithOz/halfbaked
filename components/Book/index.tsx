import React from "react";
import Image from "next/image";
import { Author as AuthorType } from "@prisma/client";

export default function Book({
  title,
  authors,
  coverUrl,
}: {
  title: string;
  authors: AuthorType[];
  coverUrl: string;
}) {
  const authorNames = authors.map((author) => author.name).join(", ");
  return (
    <div className='h-32 w-24 bg-slate-200 text-xs shadow shadow-black rounded-sm relative' title={`"${title}" by "${authorNames}"`}>
      <Image src={`${coverUrl}`} alt={`"${title}" by "${authorNames}"`} fill={true} />
    </div>
  );
}
