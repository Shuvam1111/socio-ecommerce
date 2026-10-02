'use client';
import * as React from 'react';

import { DatePicker } from '@/components/common/date-picker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ThemeSwitcher } from '@/components/theme/theme-switcher';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import { AlertTriangle, Info, Trash2 } from 'lucide-react';

import { Check, ExternalLink, RefreshCw } from 'lucide-react';

import { AlertBanner } from '@/components/common/alert-banner';

export default function UIPlaygroundPage() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = React.useState<Date | undefined>();
  const [dateTime, setDateTime] = React.useState<Date | undefined>();
  // dismisable banner
  const [showDismissibleBanner, setShowDismissibleBanner] = React.useState(true);

  async function handleDelete() {
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    setLoading(false);
    setDeleteDialogOpen(false);
  }
  return (
    <main className="min-h-screen bg-background px-6 py-12 text-foreground">
      <div className="mx-auto max-w-6xl space-y-12">
        {/* Page Header */}

        <section>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Development</p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight">UI Playground</h1>

          <p className="mt-3 max-w-2xl text-muted-foreground">
            Temporary development page for testing shadcn/ui components, variants, spacing,
            typography, and the application theme system.
          </p>
        </section>

        {/* Theme */}

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Themes</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Test the global theme system across all UI components.
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <ThemeSwitcher />
            </CardContent>
          </Card>
        </section>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => toast.success('Product added to cart.')}>Success</Button>

          <Button onClick={() => toast.error('Something went wrong.')}>Error</Button>

          <Button onClick={() => toast.warning('Only a few items are left.')}>Warning</Button>

          <Button onClick={() => toast.info('Your order is being processed.')}>Info</Button>
          <Button onClick={() => toast.loading('Processing your order...')}>Loading</Button>
        </div>
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Confirmation Dialog</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Reusable confirmation dialog for destructive and important actions.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Delete Confirmation</CardTitle>

              <CardDescription>
                Test the reusable confirmation pattern with loading state.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Button
                className="rounded-sm p-5"
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete Vendor
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Dialog System
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight">Alert Dialogs</h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Confirmation dialogs for destructive actions, important decisions, warnings, and other
              actions that require explicit user confirmation.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Basic */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Confirmation</CardTitle>
                <CardDescription>Simple decision with cancel and continue actions.</CardDescription>
              </CardHeader>

              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button>Open Dialog</Button>
                  </AlertDialogTrigger>

                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Continue with this action?</AlertDialogTitle>

                      <AlertDialogDescription>
                        This will continue the selected operation. You can cancel if you are not
                        ready.
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>

                      <AlertDialogAction>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>

            {/* Destructive */}
            <Card>
              <CardHeader>
                <CardTitle>Destructive</CardTitle>
                <CardDescription>For permanent or potentially harmful actions.</CardDescription>
              </CardHeader>

              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 />
                      Delete Product
                    </Button>
                  </AlertDialogTrigger>

                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogMedia>
                        <Trash2 className="text-destructive" />
                      </AlertDialogMedia>

                      <AlertDialogTitle>Delete this product?</AlertDialogTitle>

                      <AlertDialogDescription>
                        This action cannot be undone. The product and its associated information
                        will be permanently removed.
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>

                      <AlertDialogAction variant="destructive">Delete Product</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>

            {/* Warning */}
            <Card>
              <CardHeader>
                <CardTitle>Warning</CardTitle>
                <CardDescription>
                  For actions that need attention before continuing.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline">
                      <AlertTriangle />
                      Continue
                    </Button>
                  </AlertDialogTrigger>

                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogMedia>
                        <AlertTriangle className="text-warning" />
                      </AlertDialogMedia>

                      <AlertDialogTitle>Stock is running low</AlertDialogTitle>

                      <AlertDialogDescription>
                        Only 3 units are currently available. Continuing may result in the product
                        becoming unavailable.
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                      <AlertDialogCancel>Go Back</AlertDialogCancel>

                      <AlertDialogAction>Continue Anyway</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>

            {/* Information */}
            <Card>
              <CardHeader>
                <CardTitle>Information</CardTitle>
                <CardDescription>
                  Useful when confirmation is required for an informational situation.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline">
                      <Info />
                      View Information
                    </Button>
                  </AlertDialogTrigger>

                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogMedia>
                        <Info className="text-info" />
                      </AlertDialogMedia>

                      <AlertDialogTitle>Additional verification required</AlertDialogTitle>

                      <AlertDialogDescription>
                        You may need to verify your identity before completing this operation.
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>

                      <AlertDialogAction>Verify Now</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>

            {/* Small */}
            <Card>
              <CardHeader>
                <CardTitle>Small Dialog</CardTitle>
                <CardDescription>Compact version for short confirmations.</CardDescription>
              </CardHeader>

              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="secondary">Open Small Dialog</Button>
                  </AlertDialogTrigger>

                  <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Sign out?</AlertDialogTitle>

                      <AlertDialogDescription>
                        You will need to sign in again to access your account.
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                      <AlertDialogCancel>Stay</AlertDialogCancel>

                      <AlertDialogAction>Sign Out</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>

            {/* Long Content */}
            <Card>
              <CardHeader>
                <CardTitle>Long Description</CardTitle>
                <CardDescription>Demonstrates longer explanatory content.</CardDescription>
              </CardHeader>

              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline">Open Details</Button>
                  </AlertDialogTrigger>

                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel this order?</AlertDialogTitle>

                      <AlertDialogDescription>
                        Your order has already been processed by the seller. Cancelling it may
                        require additional processing time. Any eligible refund will be handled
                        according to the applicable refund policy.
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Order</AlertDialogCancel>

                      <AlertDialogAction variant="destructive">Cancel Order</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </section>

        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete vendor?"
          description="This action cannot be undone. The vendor and its associated data will be permanently deleted."
          confirmText="Delete Vendor"
          cancelText="Keep Vendor"
          variant="destructive"
          loading={loading}
          onConfirm={handleDelete}
        />

        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold">Date Picker</h2>

            <p className="text-sm text-muted-foreground">
              AD and BS calendar with optional time support.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium">Date only</p>

              <DatePicker value={date} onChange={setDate} />

              <p className="text-xs text-muted-foreground">
                {date ? date.toString() : 'No date selected'}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Date and time</p>

              <DatePicker value={dateTime} onChange={setDateTime} includeTime />

              <p className="text-xs text-muted-foreground">
                {dateTime ? dateTime.toString() : 'No date and time selected'}
              </p>
            </div>
          </div>
        </section>

        {/* Buttons */}

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Buttons</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Test the available shadcn button variants and sizes.
            </p>
          </div>

          <Card>
            <CardContent className="flex flex-wrap items-center gap-3 pt-6">
              <Button>Default</Button>

              <Button variant="secondary">Secondary</Button>

              <Button variant="outline">Outline</Button>

              <Button variant="ghost">Ghost</Button>

              <Button variant="destructive">Destructive</Button>

              <Button variant="link">Link</Button>
            </CardContent>
          </Card>
        </section>

        {/* Button Sizes */}

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Button Sizes</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Test button sizing before using buttons throughout the application.
            </p>
          </div>

          <Card>
            <CardContent className="flex flex-wrap items-center gap-3 pt-6">
              <Button size="sm">Small</Button>

              <Button size="default">Default</Button>

              <Button size="lg">Large</Button>

              <Button size="icon" aria-label="Icon button">
                +
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Cards */}

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Cards</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Cards will be used heavily across products, checkout, orders, dashboards, and account
              pages.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Basic Card</CardTitle>

                <CardDescription>A standard application card.</CardDescription>
              </CardHeader>

              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This is the default card appearance.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Card</CardTitle>

                <CardDescription>Example of how a product section could look.</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">Wireless Headphones</p>

                    <p className="mt-1 text-sm text-muted-foreground">Premium audio</p>
                  </div>

                  <Badge>New</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Action Card</CardTitle>

                <CardDescription>Card with an action.</CardDescription>
              </CardHeader>

              <CardContent>
                <Button className="w-full">View Product</Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Inputs */}

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Inputs</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Test form controls and their relationship with labels.
            </p>
          </div>

          <Card>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label htmlFor="product-name">Product Name</Label>

                <Input id="product-name" placeholder="Enter product name" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>

                <Input id="email" type="email" placeholder="you@example.com" />
              </div>

              <div className="flex justify-end">
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">Alert Banners</h2>

            <p className="text-sm text-muted-foreground">
              Persistent, contextual feedback for important states, warnings, errors, and actions.
            </p>
          </div>

          <div className="space-y-8">
            {/* Basic variants */}
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold">Variants</h3>
                <p className="text-sm text-muted-foreground">
                  The four semantic alert types available across the application.
                </p>
              </div>

              <div className="grid gap-4">
                <AlertBanner variant="success" title="Order placed successfully" />

                <AlertBanner variant="warning" title="Only 3 items remaining" />

                <AlertBanner variant="error" title="Payment failed" />

                <AlertBanner variant="info" title="New feature available" />
              </div>
            </div>

            {/* Title + description */}
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold">Title + Description</h3>
                <p className="text-sm text-muted-foreground">
                  Use a description when the user needs additional context.
                </p>
              </div>

              <AlertBanner
                variant="success"
                title="Order placed successfully"
                description="Your order has been confirmed and is now being prepared for shipment."
              />
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold">With Action</h3>
                <p className="text-sm text-muted-foreground">
                  Add an action when the user can immediately resolve or continue from the alert.
                </p>
              </div>

              <AlertBanner
                variant="error"
                title="Payment failed"
                description="We couldn't process your payment. Please check your payment method and try again."
                action={
                  <Button size="sm">
                    <RefreshCw className="size-4" />
                    Try again
                  </Button>
                }
              />
            </div>

            {/* Multiple actions */}
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold">Multiple Actions</h3>
                <p className="text-sm text-muted-foreground">
                  Actions can contain any React node, so multiple buttons are supported.
                </p>
              </div>

              <AlertBanner
                variant="warning"
                title="Your email is not verified"
                description="Verify your email address to unlock all account features."
                action={
                  <div className="flex flex-wrap items-center gap-2">
                    <Button size="sm">
                      <Check className="size-4" />
                      Verify email
                    </Button>

                    <Button size="sm" variant="outline">
                      Resend
                    </Button>
                  </div>
                }
              />
            </div>

            {/* Dismissible */}
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold">Dismissible</h3>
                <p className="text-sm text-muted-foreground">
                  Useful for informational banners that the user can close.
                </p>
              </div>

              {showDismissibleBanner ? (
                <AlertBanner
                  variant="info"
                  title="New wishlist feature available"
                  description="You can now save products and access them later from your wishlist."
                  onDismiss={() => setShowDismissibleBanner(false)}
                />
              ) : (
                <div className="flex items-center justify-between rounded-xl border border-dashed border-border p-4">
                  <p className="text-sm text-muted-foreground">Banner dismissed.</p>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowDismissibleBanner(true)}
                  >
                    Show again
                  </Button>
                </div>
              )}
            </div>

            {/* Action + dismiss */}
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold">Action + Dismiss</h3>
                <p className="text-sm text-muted-foreground">
                  Useful when the alert has an optional action but should also be closable.
                </p>
              </div>

              <AlertBanner
                variant="warning"
                title="Complete your profile"
                description="Add your phone number and address to make checkout faster."
                action={
                  <Button size="sm" variant="outline">
                    Complete profile
                  </Button>
                }
                onDismiss={() => {}}
              />
            </div>

            {/* Long content */}
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold">Long Content</h3>
                <p className="text-sm text-muted-foreground">
                  Test how the component behaves with longer messages and responsive layouts.
                </p>
              </div>

              <AlertBanner
                variant="error"
                title="We couldn't complete your order"
                description="Something went wrong while processing your order. Your payment has not been charged. Please check your payment details and try again. If the problem continues, contact our support team."
                action={
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm">Try again</Button>

                    <Button size="sm" variant="outline">
                      Contact support
                    </Button>
                  </div>
                }
                onDismiss={() => {}}
              />
            </div>

            {/* Custom action */}
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold">Custom Action Content</h3>
                <p className="text-sm text-muted-foreground">
                  Since action accepts ReactNode, links, buttons, or custom controls can be used.
                </p>
              </div>

              <AlertBanner
                variant="info"
                title="Documentation has been updated"
                description="Learn about the latest changes and improvements."
                action={
                  <Button size="sm" variant="outline">
                    <ExternalLink className="size-4" />
                    View documentation
                  </Button>
                }
              />
            </div>

            {/* Realistic ecommerce examples */}
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold">Real-World Examples</h3>
                <p className="text-sm text-muted-foreground">
                  Examples of how AlertBanner can be used throughout Socio Commerce.
                </p>
              </div>

              <div className="grid gap-4">
                <AlertBanner
                  variant="success"
                  title="Product added to cart"
                  description="The product has been added successfully."
                  action={<Button size="sm">View cart</Button>}
                />

                <AlertBanner
                  variant="warning"
                  title="Low stock"
                  description="Only 2 units of this product are left in stock."
                />

                <AlertBanner
                  variant="error"
                  title="Unable to load products"
                  description="We couldn't retrieve the latest products. Please try again."
                  action={
                    <Button size="sm">
                      <RefreshCw className="size-4" />
                      Retry
                    </Button>
                  }
                />

                <AlertBanner
                  variant="info"
                  title="Free delivery available"
                  description="Add NPR 1,500 more to your cart to unlock free delivery."
                  action={
                    <Button size="sm" variant="outline">
                      Continue shopping
                    </Button>
                  }
                />
              </div>
            </div>

            {/* Advanced custom content */}
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold">Advanced Custom Action</h3>
                <p className="text-sm text-muted-foreground">
                  The action slot can also contain richer custom content.
                </p>
              </div>

              <AlertBanner
                variant="success"
                title="Your account is verified"
                description="You now have access to all account features."
                action={
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost">
                      View profile
                    </Button>

                    <Button size="sm">Continue</Button>
                  </div>
                }
              />
            </div>
          </div>
        </section>

        {/* Badges */}

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Badges</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Useful for product status, order status, categories, and labels.
            </p>
          </div>

          <Card>
            <CardContent className="flex flex-wrap gap-3 pt-6">
              <Badge>Default</Badge>

              <Badge variant="secondary">Secondary</Badge>

              <Badge variant="outline">Outline</Badge>

              <Badge variant="destructive">Destructive</Badge>
            </CardContent>
          </Card>
        </section>

        {/* Semantic Colors */}

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Semantic Colors</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Verify that our custom semantic color system works with the shadcn foundation.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-primary p-6 text-primary-foreground">
              <p className="font-semibold">Primary</p>
              <p className="mt-1 text-sm opacity-80">bg-primary</p>
            </div>

            <div className="rounded-xl bg-secondary p-6 text-secondary-foreground">
              <p className="font-semibold">Secondary</p>
              <p className="mt-1 text-sm opacity-80">bg-secondary</p>
            </div>

            <div className="rounded-xl bg-accent p-6 text-accent-foreground">
              <p className="font-semibold">Accent</p>
              <p className="mt-1 text-sm opacity-80">bg-accent</p>
            </div>

            <div className="rounded-xl bg-muted p-6 text-muted-foreground">
              <p className="font-semibold">Muted</p>
              <p className="mt-1 text-sm opacity-80">bg-muted</p>
            </div>
          </div>
        </section>

        {/* Status Colors */}

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Status Colors</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Custom status tokens for future product and order interfaces.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-success p-6 text-success-foreground">
              <p className="font-semibold">Success</p>
              <p className="mt-1 text-sm opacity-80">bg-success</p>
            </div>

            <div className="rounded-xl bg-warning p-6 text-warning-foreground">
              <p className="font-semibold">Warning</p>
              <p className="mt-1 text-sm opacity-80">bg-warning</p>
            </div>

            <div className="rounded-xl bg-destructive p-6 text-destructive-foreground">
              <p className="font-semibold">Destructive</p>
              <p className="mt-1 text-sm opacity-80">bg-destructive</p>
            </div>

            <div className="rounded-xl bg-info p-6 text-info-foreground">
              <p className="font-semibold">Info</p>
              <p className="mt-1 text-sm opacity-80">bg-info</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
