'use client'

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  type PointerEvent,
} from 'react'

export type SignaturePadHandle = {
  clear: () => void
  toDataURL: () => string
  getCanvas: () => HTMLCanvasElement | null
}

type SignaturePadProps = {
  className?: string
  penColor?: string
  backgroundColor?: string
  lineWidth?: number
  disabled?: boolean
  width?: number
  height?: number
  maxWidth?: number
  maxHeight?: number
}

const SignaturePad = forwardRef<SignaturePadHandle, SignaturePadProps>(
  (
    {
      className,
      penColor = '#000000',
      backgroundColor = '#ffffff',
      lineWidth = 4,
      disabled = false,
      width,
      height,
      maxWidth,
      maxHeight,
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const isDrawingRef = useRef(false)

    const cssClasses = useMemo(() => {
      const base = 'touch-none select-none'
      return className ? `${base} ${className}` : base
    }, [className])

    const resetCanvas = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    const ensureCanvasSize = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const parent = canvas.parentElement
      if (!parent) return
      const parentRect = parent.getBoundingClientRect()
      let cssWidth = width ?? parentRect.width
      let cssHeight = height ?? parentRect.height
      if (maxWidth !== undefined) {
        cssWidth = Math.min(cssWidth, maxWidth)
      }
      if (maxHeight !== undefined) {
        cssHeight = Math.min(cssHeight, maxHeight)
      }
      if (cssWidth <= 0 || cssHeight <= 0) return
      const snapshot = canvas.toDataURL()
      const pixelRatio = window.devicePixelRatio ?? 1
      const nextWidth = Math.floor(cssWidth * pixelRatio)
      const nextHeight = Math.floor(cssHeight * pixelRatio)
      if (canvas.width === nextWidth && canvas.height === nextHeight) {
        return
      }
      canvas.width = nextWidth
      canvas.height = nextHeight
      canvas.style.width = `${cssWidth}px`
      canvas.style.height = `${cssHeight}px`
      resetCanvas()
      if (snapshot && snapshot !== 'data:,') {
        const image = new Image()
        image.onload = () => {
          const ctx = canvas.getContext('2d')
          if (!ctx) return
          ctx.drawImage(image, 0, 0, nextWidth, nextHeight)
        }
        image.src = snapshot
      }
    }

    useEffect(() => {
      ensureCanvasSize()
      const canvas = canvasRef.current
      if (!canvas || typeof ResizeObserver === 'undefined') {
        return
      }
      const resizeObserver = new ResizeObserver(() => {
        ensureCanvasSize()
      })
      resizeObserver.observe(canvas.parentElement ?? canvas)
      return () => {
        resizeObserver.disconnect()
      }
    }, [width, height, maxWidth, maxHeight])

    useEffect(() => {
      resetCanvas()
    }, [backgroundColor])

    const getContext = () => {
      const canvas = canvasRef.current
      if (!canvas) return null
      const ctx = canvas.getContext('2d')
      if (!ctx) return null
      const pixelRatio = window.devicePixelRatio ?? 1
      ctx.strokeStyle = penColor
      ctx.lineWidth = lineWidth * pixelRatio
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      return ctx
    }

    const getCoordinates = (event: PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return null
      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY,
      }
    }

    const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
      if (disabled) return
      const ctx = getContext()
      const point = getCoordinates(event)
      if (!ctx || !point) return
      event.preventDefault()
      isDrawingRef.current = true
      ctx.beginPath()
      ctx.moveTo(point.x, point.y)
    }

    const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
      if (disabled || !isDrawingRef.current) return
      const ctx = getContext()
      const point = getCoordinates(event)
      if (!ctx || !point) return
      event.preventDefault()
      ctx.lineTo(point.x, point.y)
      ctx.stroke()
    }

    const handlePointerUp = () => {
      isDrawingRef.current = false
    }

    useImperativeHandle(
      ref,
      () => ({
        clear: resetCanvas,
        toDataURL: () => canvasRef.current?.toDataURL('image/png') ?? '',
        getCanvas: () => canvasRef.current,
      }),
      []
    )

    return (
      <canvas
        ref={canvasRef}
        className={cssClasses}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />
    )
  }
)

SignaturePad.displayName = 'SignaturePad'

export default SignaturePad
