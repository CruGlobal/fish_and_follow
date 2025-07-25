import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import type { NewContactData, YearEnum, GenderEnum } from "~/lib/contactStore";
import { yearOptions, genderOptions } from "~/lib/contactStore";

interface AddContactDialogProps {
  onAddContact: (contact: NewContactData) => void;
  trigger: React.ReactNode;
}

const initialFormData: NewContactData = {
  firstName: "",
  lastName: "",
  phoneNumber: "",
  email: "",
  campus: "",
  major: "",
  year: "1",
  isInterested: false,
  gender: "prefer_not_to_say",
};

export function AddContactDialog({ onAddContact, trigger }: AddContactDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<NewContactData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof NewContactData, string>>>({});

  const handleInputChange = (field: keyof NewContactData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Effacer l'erreur pour ce champ
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof NewContactData, string>> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Le prénom est requis";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Le nom est requis";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Le téléphone est requis";
    } else if (!/^[\+]?[0-9\s\-\(\)]{8,}$/.test(formData.phoneNumber.trim())) {
      newErrors.phoneNumber = "Format de téléphone invalide";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Format d'email invalide";
    }

    if (!formData.campus.trim()) {
      newErrors.campus = "Le campus est requis";
    }

    if (!formData.major.trim()) {
      newErrors.major = "La filière est requise";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onAddContact(formData);
    setFormData(initialFormData);
    setErrors({});
    setOpen(false);
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    setErrors({});
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau contact</DialogTitle>
          <DialogDescription>
            Remplissez les informations du contact. Les champs marqués d'un * sont obligatoires.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Prénom */}
            <div>
              <Label htmlFor="firstName">Prénom *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className={errors.firstName ? "border-red-500" : ""}
                placeholder="Jean"
              />
              {errors.firstName && (
                <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>
              )}
            </div>

            {/* Nom */}
            <div>
              <Label htmlFor="lastName">Nom *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className={errors.lastName ? "border-red-500" : ""}
                placeholder="Dupont"
              />
              {errors.lastName && (
                <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Téléphone */}
          <div>
            <Label htmlFor="phoneNumber">Téléphone *</Label>
            <Input
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
              className={errors.phoneNumber ? "border-red-500" : ""}
              placeholder="+33123456789"
            />
            {errors.phoneNumber && (
              <p className="text-sm text-red-500 mt-1">{errors.phoneNumber}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email (facultatif)</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={errors.email ? "border-red-500" : ""}
              placeholder="jean.dupont@email.com"
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Campus */}
            <div>
              <Label htmlFor="campus">Campus *</Label>
              <Input
                id="campus"
                value={formData.campus}
                onChange={(e) => handleInputChange("campus", e.target.value)}
                className={errors.campus ? "border-red-500" : ""}
                placeholder="Paris"
              />
              {errors.campus && (
                <p className="text-sm text-red-500 mt-1">{errors.campus}</p>
              )}
            </div>

            {/* Filière */}
            <div>
              <Label htmlFor="major">Filière *</Label>
              <Input
                id="major"
                value={formData.major}
                onChange={(e) => handleInputChange("major", e.target.value)}
                className={errors.major ? "border-red-500" : ""}
                placeholder="Informatique"
              />
              {errors.major && (
                <p className="text-sm text-red-500 mt-1">{errors.major}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Année */}
            <div>
              <Label htmlFor="year">Année *</Label>
              <select
                id="year"
                value={formData.year}
                onChange={(e) => handleInputChange("year", e.target.value as YearEnum)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {yearOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Genre */}
            <div>
              <Label htmlFor="gender">Genre *</Label>
              <select
                id="gender"
                value={formData.gender}
                onChange={(e) => handleInputChange("gender", e.target.value as GenderEnum)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {genderOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Est intéressé */}
          <div className="flex items-center space-x-2">
            <input
              id="isInterested"
              type="checkbox"
              checked={formData.isInterested}
              onChange={(e) => handleInputChange("isInterested", e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <Label htmlFor="isInterested">Est intéressé par nos services</Label>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
            >
              Annuler
            </Button>
            <Button type="submit">
              Ajouter le contact
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
