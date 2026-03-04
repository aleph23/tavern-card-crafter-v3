import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/glass/card'
import { Button } from '@/components/ui/glass/button'

export function TestGlassVariants() {
  const [variant, setVariant] = useState<'glass' | 'frosted' | 'fluted' | 'crystal'>('glass')

  return (
    <div className='p-8 space-y-8 bg-black/50 min-h-screen relative'>
      {/* A colorful background behind it all to test translucency */}
      <div className='absolute inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-indigo-500/30 via-purple-500/30 to-background'></div>

      <div className='flex gap-4 mb-8'>
        <Button variant={variant === 'glass' ? 'default' : 'secondary'} onClick={() => setVariant('glass')}>
          Glass (Default)
        </Button>
        <Button variant={variant === 'frosted' ? 'default' : 'secondary'} onClick={() => setVariant('frosted')}>
          Frosted
        </Button>
        <Button variant={variant === 'fluted' ? 'default' : 'secondary'} onClick={() => setVariant('fluted')}>
          Fluted
        </Button>
        <Button variant={variant === 'crystal' ? 'default' : 'secondary'} onClick={() => setVariant('crystal')}>
          Crystal
        </Button>
      </div>

      <Card variant={variant} className='w-full max-w-md'>
        <CardHeader>
          <CardTitle>Glass Variant Test</CardTitle>
          <CardDescription>Currently viewing the "{variant}" variant.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className='text-sm text-muted-foreground'>
            This card is rendering using the centralized global glassVariants utility. You should see distinct visual
            differences as you toggle through the variants above.
          </p>
        </CardContent>
        <CardFooter className='flex justify-end gap-2'>
          <Button
            variant='outline'
            className='border-secondary text-secondary hover:bg-secondary/10 hover:text-secondary-foreground'
          >
            Cancel
          </Button>
          <Button effect='glow'>Confirm Action</Button>
        </CardFooter>
      </Card>

      {/* Sample button block with glass variant applied directly */}
      <div className='flex gap-4 mt-8 p-4 rounded-xl border border-white/10 bg-white/5'>
        <Button variant={variant} effect='none'>
          Test Button ({variant})
        </Button>
        <Button variant={variant} effect='glow'>
          Glow Effect
        </Button>
        <Button variant={variant} effect='shimmer'>
          Shimmer
        </Button>
      </div>
    </div>
  )
}
