'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import BasicInformationStep from './steps/BasicInformationStep';
import BrandingStep from './steps/BrandingStep';
import DomainSetupStep from './steps/DomainSetupStep';
import OwnerAccountStep from './steps/OwnerAccountStep';
import api from '@/lib/api';

const STEPS = [
  { id: 'basic', title: 'Basic Information', component: BasicInformationStep },
  { id: 'branding', title: 'Branding', component: BrandingStep },
  { id: 'domain', title: 'Domain Setup', component: DomainSetupStep },
  { id: 'account', title: 'Owner Account', component: OwnerAccountStep },
];

export default function SiteCreationWizard({ 
  onSiteCreated, 
  onCancel, 
  isCreating, 
  setIsCreating 
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    siteName: '',
    description: '',
    category: '',
    
    // Step 2: Branding
    logoUrl: '',
    selectedTheme: '',
    primaryColor: '',
    secondaryColor: '',
    
    // Step 3: Domain Setup
    domainType: 'subdomain',
    customDomain: '',
    subdomain: '',
    agreeToTerms: false,
    
    // Step 4: Owner Account
    ownerEmail: '',
    ownerPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  const updateFormData = (stepData) => {
    setFormData(prev => ({ ...prev, ...stepData }));
    setErrors({});
  };

  const validateCurrentStep = () => {
    const step = STEPS[currentStep];
    let stepErrors = {};

    switch (step.id) {
      case 'basic':
        if (!formData.siteName.trim()) {
          stepErrors.siteName = 'Site name is required';
        } else if (formData.siteName.length < 3 || formData.siteName.length > 50) {
          stepErrors.siteName = 'Site name must be between 3 and 50 characters';
        }
        if (!formData.category) {
          stepErrors.category = 'Please select a category';
        }
        if (formData.description && formData.description.length > 200) {
          stepErrors.description = 'Description must be less than 200 characters';
        }
        break;

      case 'branding':
        if (!formData.selectedTheme) {
          stepErrors.selectedTheme = 'Please select a theme';
        }
        break;

      case 'domain':
        if (formData.domainType === 'custom') {
          if (!formData.customDomain.trim()) {
            stepErrors.customDomain = 'Custom domain is required';
          } else if (!/^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.([a-zA-Z]{2,})$/.test(formData.customDomain)) {
            stepErrors.customDomain = 'Please enter a valid domain (e.g., example.com)';
          }
        } else {
          if (!formData.subdomain.trim()) {
            stepErrors.subdomain = 'Subdomain is required';
          } else if (!/^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*$/.test(formData.subdomain) || formData.subdomain.length < 3 || formData.subdomain.length > 20) {
            stepErrors.subdomain = 'Subdomain must be 3-20 characters, alphanumeric only';
          }
        }
        if (!formData.agreeToTerms) {
          stepErrors.agreeToTerms = 'You must agree to the terms of service';
        }
        break;

      case 'account':
        if (!formData.ownerEmail.trim()) {
          stepErrors.ownerEmail = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.ownerEmail)) {
          stepErrors.ownerEmail = 'Please enter a valid email address';
        }
        if (!formData.ownerPassword) {
          stepErrors.ownerPassword = 'Password is required';
        } else if (formData.ownerPassword.length < 8) {
          stepErrors.ownerPassword = 'Password must be at least 8 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.ownerPassword)) {
          stepErrors.ownerPassword = 'Password must include uppercase, lowercase, and number';
        }
        if (formData.ownerPassword !== formData.confirmPassword) {
          stepErrors.confirmPassword = 'Passwords do not match';
        }
        break;
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateCurrentStep()) return;

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - create the site
      await handleCreateSite();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreateSite = async () => {
    try {
      setIsCreating(true);
      
      const siteData = {
        name: formData.siteName,
        description: formData.description,
        category: formData.category,
        domainType: formData.domainType,
        customDomain: formData.domainType === 'custom' ? formData.customDomain : '',
        subdomain: formData.domainType === 'subdomain' ? formData.subdomain : '',
        ownerEmail: formData.ownerEmail,
        ownerPassword: formData.ownerPassword,
        theme: {
          selectedTheme: formData.selectedTheme,
          primaryColor: formData.primaryColor,
          secondaryColor: formData.secondaryColor,
          logoUrl: formData.logoUrl,
        },
      };

      console.log('Creating site with data:', siteData);
      console.log('Domain type:', formData.domainType);
      console.log('Subdomain value:', formData.subdomain);
      console.log('Custom domain value:', formData.customDomain);

      const response = await api.sites.create(siteData);
      
      // IMPORTANT: Don't update the token from site creation
      // The response includes a site owner token, but we want to stay as platform user
      console.log('Site creation response:', response.data);
      
      onSiteCreated(response.data);
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsCreating(false);
    }
  };

  const CurrentStepComponent = STEPS[currentStep].component;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <div className="p-6">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${index <= currentStep 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
                }
              `}>
                {index + 1}
              </div>
              <span className={`
                ml-2 text-sm font-medium
                ${index <= currentStep ? 'text-blue-600' : 'text-gray-500'}
              `}>
                {step.title}
              </span>
              {index < STEPS.length - 1 && (
                <div className={`
                  ml-4 w-12 h-0.5
                  ${index < currentStep ? 'bg-blue-600' : 'bg-gray-200'}
                `} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Current Step Content */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {STEPS[currentStep].title}
        </h2>
        <CurrentStepComponent
          formData={formData}
          updateFormData={updateFormData}
          errors={errors}
        />
      </div>

      {/* Submit Error */}
      {errors.submit && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <div>
          {!isFirstStep && (
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isCreating}
            >
              Back
            </Button>
          )}
        </div>

        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isCreating}
          >
            Cancel
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={isCreating}
            loading={isCreating && isLastStep}
          >
            {isLastStep ? 'Create Site' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}