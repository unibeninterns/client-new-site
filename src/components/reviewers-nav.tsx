import React from 'react';
import Link from 'next/link';

interface ProgressNavigatorProps {
    currentStep: 1 | 2 | 3;
}

const ProgressNavigator: React.FC<ProgressNavigatorProps> = ({ currentStep }) => {
    const steps = [
        { 
            number: 1,
            label: 'Assignment', 
            href: '/assignment',
            isActive: currentStep === 1 
        },
        { 
            number: 2, 
            label: 'Proposal Review', 
            href: '/proposal-review',
            isActive: currentStep === 2 
        },
        { 
            number: 3, 
            label: 'Submission', 
            href: '/submission',
            isActive: currentStep === 3 
        }
    ];

    return (
        <div className="w-full py-4">
            <div className="max-w-xl mx-auto relative">
                {/* Progress Line */}
                <div className="absolute top-1/2 transform -translate-y-1/2 left-0 right-0 h-1 bg-gray-300 flex">
                    <div 
                        className={`h-full ${currentStep > 1 ? 'bg-purple-600' : 'bg-gray-300'}`} 
                        style={{ width: '50%' }} 
                    />
                    <div 
                        className={`h-full ${currentStep > 2 ? 'bg-purple-600' : 'bg-gray-300'}`} 
                        style={{ width: '50%' }} 
                    />
                </div>

                {/* Steps */}
                <div className="relative flex justify-between items-center z-10">
                    {steps.map((step, index) => (
                        <Link 
                            key={step.number} 
                            href={step.href}
                            className={`
                                flex flex-col items-center space-y-2
                                ${index < currentStep - 1 ? 'cursor-pointer' : 'cursor-not-allowed'}
                            `}
                        >
                            <div 
                                className={`
                                    w-8 h-8 rounded-full flex items-center justify-center 
                                    ${step.isActive 
                                        ? 'bg-purple-600 text-white' 
                                        : index < currentStep - 1 
                                            ? 'bg-purple-300 text-white' 
                                            : 'bg-gray-300 text-gray-600'}
                                    transition-colors duration-300
                                `}
                            >
                                {step.number}
                            </div>
                            <span 
                                className={`
                                    text-sm font-medium 
                                    ${step.isActive 
                                        ? 'text-purple-700' 
                                        : index < currentStep - 1 
                                            ? 'text-purple-500' 
                                            : 'text-gray-500'}
                                    hidden md:block
                                `}
                            >
                                {step.label}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProgressNavigator;