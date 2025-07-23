import React, { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { apiService } from '~/lib/api'
import type { TemplateItem, TemplateComponent } from '~/lib/api'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { Button } from './ui/button'


function TemplateSelector() {
  const [templates, setTemplates] = useState<TemplateItem[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true)
        const response = await apiService.getTemplates()
        console.log("API response:", response)
        // Handle the nested structure: response.templates
        const templatesData = response?.templates || []
        setTemplates(templatesData)
      } catch (err) {
        console.error("Failed to fetch templates:", err)
        setError("Failed to load templates")
      } finally {
        setLoading(false)
      }
    }

    fetchTemplates()
  }, [])

  const handleTemplateSelect = (templateName: string) => {
    console.log("Selected template:", templateName)
    const template = templates.find(t => t.name === templateName)
    setSelectedTemplate(template || null)
  }

  const handleSendMessage = async () => {
    if (!selectedTemplate) {
      console.error("No template selected")
      return
    }
    
    setIsSubmitting(true)
    try {
      // Simulate API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      console.log("Sending message with template:", selectedTemplate)
      setIsSubmitted(true)
    } catch (err) {
      console.error("Failed to send message:", err)
      // Handle error - could show error message here
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSendAnother = () => {
    setIsSubmitted(false)
    setSelectedTemplate(null)
  }

  if (loading) {
    return (
      <div className="py-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>  
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-4">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800 text-sm">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-4">
      <div className='pb-4'>
        <label htmlFor="template-select" className="block text-sm font-medium text-gray-700 mb-2">
          Select Email Template
        </label>
        <Select value={selectedTemplate?.name || ''} onValueChange={handleTemplateSelect}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Theme" />
          </SelectTrigger>
          <SelectContent id="template-select">
            {templates.map((template) => (
              <SelectItem key={template.id} value={template.name}>
                {template.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedTemplate && !isSubmitted && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">WhatsApp Template Preview</h3>
          
          <div className="space-y-4">
            {/* Template Info */}
            <div className="bg-white rounded-lg p-4 border border-gray-200 mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Name</div>
                  <div className="text-sm font-medium text-gray-900">{selectedTemplate.name}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Language</div>
                  <div className="text-sm text-gray-900">{selectedTemplate.language}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Category</div>
                  <div className="text-sm text-gray-900">{selectedTemplate.category}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</div>
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedTemplate.status === 'APPROVED' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedTemplate.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Template Preview:</h4>
              <div className="space-y-2">
                {selectedTemplate.components.map((component: TemplateComponent, index: number) => (
                  <div key={index} className={`text-sm ${
                    component.type === 'HEADER' ? 'font-semibold text-blue-900' :
                    component.type === 'BODY' ? 'text-gray-800' :
                    'text-gray-600 text-xs'
                  }`}>
                    {component.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-center mt-6">
            <Button 
              className="w-48" 
              onClick={handleSendMessage}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </div>
        </div>
      )}

      {/* Success Message */}
      {isSubmitted && (
        <div className="border border-green-200 rounded-lg p-6 bg-green-50">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-green-900 mb-2">Message Sent Successfully!</h3>
            <p className="text-green-700 mb-6">
              Your WhatsApp template "{selectedTemplate?.name}" has been sent successfully to the selected contacts.
            </p>
            <div className="flex justify-center gap-3">
              <Button onClick={handleSendAnother} className="bg-green-600 hover:bg-green-700">
                Send Another Template
              </Button>
              <Button variant="outline" asChild className="border-green-300 text-green-700 hover:bg-green-100">
                <Link to="/contacts">
                  Back to Contacts
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TemplateSelector