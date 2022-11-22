import React from "react";

export default function Book({
  title,
  author,
}: {
  title: string;
  author: string;
}) {
  return (
    <div className='h-32 w-24 bg-slate-200 shadow shadow-black' title={`"${title}" by "${author}"`}></div>
  );
}
