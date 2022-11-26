import React from "react";
import Image from "next/image";
import { Author as AuthorType } from "@prisma/client";

export default function Book({
  title,
  author,
  // coverUrl,
}: {
  title: string;
  author: AuthorType;
  // coverUrl: string;
}) {
  return (
    <div className='h-32 w-24 bg-slate-200 shadow shadow-black rounded-sm relative' title={`"${title}" by "${author.name}"`}>
      {/* <Image src={coverUrl} alt={`"${title}" by "${author}"`} fill={true} /> */}
    </div>
  );
}
