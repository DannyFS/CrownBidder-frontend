'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import BasicAuctionDetails from './steps/BasicAuctionDetails';
import AuctionItems from './steps/AuctionItems';
import SchedulingSettings from './steps/SchedulingSettings';
import ReviewAndCreate from './steps/ReviewAndCreate';
import api from '@/lib/api';

const STEPS = [
  { id: 'details', title: 'Basic Details', component: BasicAuctionDetails },
  { id: 'items', title: 'Auction Items', component: AuctionItems },
  { id: 'scheduling', title: 'Scheduling', component: SchedulingSettings },
  { id: 'review', title: 'Review', component: ReviewAndCreate },
];

export default function AuctionCreationForm({ 
  siteId,
  onAuctionCreated, 
  onCancel, 
  isCreating, 
  setIsCreating 
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // Basic Details
    title: '',
    description: '',
    category: '',
    termsConditions: '',
    
    // Items
    items: [],
    
    // Scheduling
    startTime: '',
    endTime: '',
    bidIncrement: 5,
    reserveEnabled: false,
    autoExtend: true,
    autoExtendMinutes: 5,
    
    // Settings
    requireRegistration: true,
    allowPhoneBidding: false,
    allowProxyBidding: true,
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
      case 'details':
        if (!formData.title.trim()) {
          stepErrors.title = 'Auction title is required';
        } else if (formData.title.length < 5 || formData.title.length > 100) {
          stepErrors.title = 'Title must be between 5 and 100 characters';
        }
        if (!formData.description.trim()) {
          stepErrors.description = 'Description is required';
        } else if (formData.description.length < 20) {
          stepErrors.description = 'Description must be at least 20 characters';
        }
        if (!formData.category) {
          stepErrors.category = 'Please select a category';
        }
        break;

      case 'items':
        if (!formData.items.length) {
          stepErrors.items = 'At least one auction item is required';
        } else {
          formData.items.forEach((item, index) => {
            if (!item.title?.trim()) {
              stepErrors[`item_${index}_title`] = `Item ${index + 1} title is required`;
            }
            if (!item.startingBid || item.startingBid <= 0) {
              stepErrors[`item_${index}_startingBid`] = `Item ${index + 1} must have a valid starting bid`;
            }
          });
        }
        break;

      case 'scheduling':
        const now = new Date();
        const startTime = new Date(formData.startTime);
        const endTime = new Date(formData.endTime);
        
        if (!formData.startTime) {
          stepErrors.startTime = 'Start time is required';
        } else if (startTime <= now) {
          stepErrors.startTime = 'Start time must be in the future';
        }
        
        if (!formData.endTime) {
          stepErrors.endTime = 'End time is required';
        } else if (endTime <= startTime) {
          stepErrors.endTime = 'End time must be after start time';
        }
        
        if (!formData.bidIncrement || formData.bidIncrement <= 0) {
          stepErrors.bidIncrement = 'Bid increment must be greater than 0';
        }
        break;

      case 'review':
        // No additional validation needed for review step
        break;
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleCreateAuction();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreateAuction = async () => {
    try {
      setIsCreating(true);
      
      const auctionData = {
        siteId,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        termsConditions: formData.termsConditions,
        startTime: formData.startTime,
        endTime: formData.endTime,
        settings: {
          bidIncrement: formData.bidIncrement,
          requireRegistration: formData.requireRegistration,
          allowPhoneBidding: formData.allowPhoneBidding,
          allowProxyBidding: formData.allowProxyBidding,
          autoExtend: formData.autoExtend,
          autoExtendMinutes: formData.autoExtendMinutes,
        },
        items: formData.items.map(item => ({
          title: item.title,
          description: item.description,
          startingBid: parseFloat(item.startingBid),
          reservePrice: item.reserveEnabled ? parseFloat(item.reservePrice) : null,
          imageUrls: item.imageUrls || [],
          category: item.category,
          condition: item.condition,
          dimensions: item.dimensions,
          weight: item.weight,
        }))
      };

      const response = await api.auctions.create(auctionData);
      onAuctionCreated(response.data);
      
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
                ml-2 text-sm font-medium hidden sm:block
                ${index <= currentStep ? 'text-blue-600' : 'text-gray-500'}
              `}>
                {step.title}
              </span>
              {index < STEPS.length - 1 && (
                <div className={`
                  ml-4 w-8 sm:w-12 h-0.5
                  ${index < currentStep ? 'bg-blue-600' : 'bg-gray-200'}
                `} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Current Step Content */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {STEPS[currentStep].title}
        </h2>
        <CurrentStepComponent
          formData={formData}
          updateFormData={updateFormData}
          errors={errors}
          siteId={siteId}
        />
      </div>

      {/* Submit Error */}
      {errors.submit && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error creating auction
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{errors.submit}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <div>
          {!isFirstStep ? (
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isCreating}
            >
              Back
            </Button>
          ) : (
            <div />
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
            {isLastStep ? 'Create Auction' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}