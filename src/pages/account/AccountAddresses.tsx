import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, MapPin, Trash2, Loader2, Check, Pencil, X } from 'lucide-react';
import { useAddresses } from '@/hooks/useAddresses';
import { Address } from '@/types/account';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';

const addressSchema = z.object({
  label: z.string().optional(),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  address_line_1: z.string().min(1, 'Address is required'),
  address_line_2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().optional(),
  postal_code: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  is_default_shipping: z.boolean().optional(),
  is_default_billing: z.boolean().optional(),
});

type AddressFormData = z.infer<typeof addressSchema>;

export default function AccountAddresses() {
  const { addresses, isLoading, addAddress, updateAddress, deleteAddress } = useAddresses();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      country: 'US',
      is_default_shipping: false,
      is_default_billing: false,
    },
  });

  const isDefaultShipping = watch('is_default_shipping');
  const isDefaultBilling = watch('is_default_billing');

  const handleEdit = (address: Address) => {
    setEditingId(address.id);
    setShowForm(true);
    reset({
      label: address.label || 'Home',
      first_name: address.first_name,
      last_name: address.last_name,
      phone: address.phone || '',
      address_line_1: address.address_line_1,
      address_line_2: address.address_line_2 || '',
      city: address.city,
      state: address.state || '',
      postal_code: address.postal_code,
      country: address.country,
      is_default_shipping: address.is_default_shipping,
      is_default_billing: address.is_default_billing,
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    reset({
      label: 'Home',
      first_name: '',
      last_name: '',
      phone: '',
      address_line_1: '',
      address_line_2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'US',
      is_default_shipping: false,
      is_default_billing: false,
    });
  };

  const onSubmit = async (data: AddressFormData) => {
    setIsSaving(true);
    try {
      if (editingId) {
        await updateAddress(editingId, data as Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'>);
      } else {
        await addAddress({
          first_name: data.first_name,
          last_name: data.last_name,
          address_line_1: data.address_line_1,
          city: data.city,
          postal_code: data.postal_code,
          country: data.country,
          label: data.label || 'Home',
          phone: data.phone,
          address_line_2: data.address_line_2,
          state: data.state,
          is_default_shipping: data.is_default_shipping || false,
          is_default_billing: data.is_default_billing || false,
        });
      }
      handleCancel();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await deleteAddress(id);
    setDeletingId(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl font-light tracking-wide text-foreground">Saved Addresses</h1>
          <p className="text-muted-foreground mt-1">Manage your shipping and billing addresses</p>
        </div>
        {!showForm && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowForm(true)}
            className="gap-2"
          >
            <Plus size={16} />
            Add Address
          </Button>
        )}
      </motion.div>

      {/* Add/Edit form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6 border border-border bg-secondary/30">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm uppercase tracking-wider text-muted-foreground">
                  {editingId ? 'Edit Address' : 'New Address'}
                </h2>
                <button
                  onClick={handleCancel}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="label" className="text-sm font-normal">
                      Label
                    </Label>
                    <Input
                      id="label"
                      placeholder="e.g., Home, Work"
                      className="h-11 bg-background"
                      {...register('label')}
                    />
                  </div>
                  <div className="hidden sm:block" />
                  
                  <div className="space-y-2">
                    <Label htmlFor="first_name" className="text-sm font-normal">
                      First Name
                    </Label>
                    <Input
                      id="first_name"
                      className={`h-11 bg-background ${errors.first_name ? 'border-destructive' : ''}`}
                      {...register('first_name')}
                    />
                    {errors.first_name && (
                      <p className="text-xs text-destructive">{errors.first_name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="last_name" className="text-sm font-normal">
                      Last Name
                    </Label>
                    <Input
                      id="last_name"
                      className={`h-11 bg-background ${errors.last_name ? 'border-destructive' : ''}`}
                      {...register('last_name')}
                    />
                    {errors.last_name && (
                      <p className="text-xs text-destructive">{errors.last_name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="address_line_1" className="text-sm font-normal">
                      Address Line 1
                    </Label>
                    <Input
                      id="address_line_1"
                      className={`h-11 bg-background ${errors.address_line_1 ? 'border-destructive' : ''}`}
                      {...register('address_line_1')}
                    />
                    {errors.address_line_1 && (
                      <p className="text-xs text-destructive">{errors.address_line_1.message}</p>
                    )}
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="address_line_2" className="text-sm font-normal">
                      Address Line 2 <span className="text-muted-foreground">(optional)</span>
                    </Label>
                    <Input
                      id="address_line_2"
                      className="h-11 bg-background"
                      {...register('address_line_2')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-normal">
                      City
                    </Label>
                    <Input
                      id="city"
                      className={`h-11 bg-background ${errors.city ? 'border-destructive' : ''}`}
                      {...register('city')}
                    />
                    {errors.city && (
                      <p className="text-xs text-destructive">{errors.city.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-sm font-normal">
                      State / Province
                    </Label>
                    <Input
                      id="state"
                      className="h-11 bg-background"
                      {...register('state')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postal_code" className="text-sm font-normal">
                      Postal Code
                    </Label>
                    <Input
                      id="postal_code"
                      className={`h-11 bg-background ${errors.postal_code ? 'border-destructive' : ''}`}
                      {...register('postal_code')}
                    />
                    {errors.postal_code && (
                      <p className="text-xs text-destructive">{errors.postal_code.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-sm font-normal">
                      Country
                    </Label>
                    <Input
                      id="country"
                      className={`h-11 bg-background ${errors.country ? 'border-destructive' : ''}`}
                      {...register('country')}
                    />
                    {errors.country && (
                      <p className="text-xs text-destructive">{errors.country.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-normal">
                      Phone <span className="text-muted-foreground">(optional)</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      className="h-11 bg-background"
                      {...register('phone')}
                    />
                  </div>
                </div>

                {/* Default checkboxes */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={isDefaultShipping}
                      onCheckedChange={(checked) => setValue('is_default_shipping', !!checked)}
                    />
                    <span className="text-sm text-foreground">Set as default shipping</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={isDefaultBilling}
                      onCheckedChange={(checked) => setValue('is_default_billing', !!checked)}
                    />
                    <span className="text-sm text-foreground">Set as default billing</span>
                  </label>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="h-10 bg-foreground text-background hover:bg-foreground/90"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : editingId ? (
                      'Save Changes'
                    ) : (
                      'Add Address'
                    )}
                  </Button>
                  <Button type="button" variant="ghost" onClick={handleCancel} className="h-10">
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Addresses list */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="p-6 border border-border">
              <Skeleton className="h-4 w-20 mb-4" />
              <Skeleton className="h-4 w-48 mb-2" />
              <Skeleton className="h-4 w-40" />
            </div>
          ))
        ) : addresses.length > 0 ? (
          addresses.map((address, index) => (
            <motion.div
              key={address.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="p-6 border border-border bg-background hover:border-foreground/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground uppercase tracking-wide">
                    {address.label || 'Address'}
                  </span>
                  {(address.is_default_shipping || address.is_default_billing) && (
                    <div className="flex gap-1">
                      {address.is_default_shipping && (
                        <span className="px-2 py-0.5 bg-foreground text-background text-xs rounded">
                          Shipping
                        </span>
                      )}
                      {address.is_default_billing && (
                        <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded">
                          Billing
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(address)}
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Edit address"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    disabled={deletingId === address.id}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                    aria-label="Delete address"
                  >
                    {deletingId === address.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </div>

              <div className="text-sm text-foreground space-y-0.5">
                <p>{address.first_name} {address.last_name}</p>
                <p className="text-muted-foreground">{address.address_line_1}</p>
                {address.address_line_2 && (
                  <p className="text-muted-foreground">{address.address_line_2}</p>
                )}
                <p className="text-muted-foreground">
                  {address.city}{address.state && `, ${address.state}`} {address.postal_code}
                </p>
                <p className="text-muted-foreground">{address.country}</p>
                {address.phone && (
                  <p className="text-muted-foreground pt-1">{address.phone}</p>
                )}
              </div>
            </motion.div>
          ))
        ) : !showForm ? (
          <div className="p-16 border border-dashed border-border text-center">
            <MapPin className="mx-auto text-muted-foreground mb-4" size={40} strokeWidth={1} />
            <h3 className="text-lg font-light text-foreground mb-2">No addresses saved</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Add an address for faster checkout
            </p>
            <Button variant="outline" onClick={() => setShowForm(true)}>
              <Plus size={16} className="mr-2" />
              Add Your First Address
            </Button>
          </div>
        ) : null}
      </motion.div>
    </div>
  );
}
