import React from "react";
import Image from "next/image";

export default function Book({
  title,
  author,
  coverUrl,
}: {
  title: string;
  author: string;
  coverUrl: string;
}) {
  return (
    <div className='h-32 w-24 bg-slate-200 shadow shadow-black rounded-sm relative' title={`"${title}" by "${author}"`}>
      <Image src={coverUrl} alt={`"${title}" by "${author}"`} fill={true} />
    </div>
  );
}
