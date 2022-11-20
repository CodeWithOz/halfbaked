import React from "react"
import styles from './shelf.module.scss'
import { mergeClasses } from "../../utils"

export default function Shelf({ children }: { children: React.ReactNode }) {
  return (
    <section className='2xl:py-7 relative text-amber-900 text-xl lg:text-3xl 2xl:text-6xl font-bold'>
      <div className={mergeClasses([styles.cuboid__container])}>
        <div className={mergeClasses([styles.cuboid])}>
          <div className={mergeClasses([
            styles.cuboid__face,
            styles['cuboid__face--front'],
            'bg-transparent shadow shadow-black',
          ])}></div>
          <div className={mergeClasses([
            styles.cuboid__face,
            styles['cuboid__face--back'],
            'shadow shadow-black',
          ])}></div>
          {/* <div className={mergeClasses([
            styles.cuboid__face,
            styles['cuboid__face--left'],
          ])}></div>
          <div className={mergeClasses([
            styles.cuboid__face,
            styles['cuboid__face--right'],
          ])}></div> */}
          {/* <div className={mergeClasses([
            styles.cuboid__face,
            styles['cuboid__face--top'],
          ])}></div> */}
          <div className={mergeClasses([
            styles.cuboid__face,
            styles['cuboid__face--bottom'],
            'shadow-2xl shadow-black',
          ])}></div>
        </div>
      </div>
      <div className="books-container flex justify-center gap-12 h-40 items-end py-1 relative shadow-inner-2 [--shadow-color:var(--color-shelf-shadow)]">
        {children}
      </div>
      <div className={mergeClasses([styles['floor-thickness'], 'h-4'])}></div>
    </section>
  )
}

export const shelfSideSpace = 48;

// corresponds to gap-12
export const interBookSpace = 48;