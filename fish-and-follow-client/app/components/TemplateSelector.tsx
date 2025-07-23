import React, { useEffect, useState } from 'react'
import { apiService } from '~/lib/api'
import type { Template } from '~/lib/api'

function TemplateSelector() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true)
        const templatesData = await apiService.getTemplates()
        setTemplates(templatesData)
        console.log("Fetched templates:", templatesData)
      } catch (err) {
        console.error("Failed to fetch templates:", err)
        setError("Failed to load templates")
      } finally {
        setLoading(false)
      }
    }

    fetchTemplates()
  }, [])

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    setSelectedTemplate(template || null)
  }

  if (loading) {
    return (
      <div className="p-4">
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
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800 text-sm">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6">
      <div>
        <label htmlFor="template-select" className="block text-sm font-medium text-gray-700 mb-2">
          Select Email Template
        </label>
        <select
          id="template-select"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={selectedTemplate?.id || ''}
          onChange={(e) => handleTemplateSelect(e.target.value)}
        >
          <option value="">Choose a template...</option>
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
      </div>

      {selectedTemplate && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Template Preview</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject:</label>
              <div className="bg-white border border-gray-300 rounded-md p-3 text-gray-900">
                {selectedTemplate.subject}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content:</label>
              <div className="bg-white border border-gray-300 rounded-md p-3 text-gray-900 min-h-[120px] whitespace-pre-wrap">
                {selectedTemplate.content}
              </div>
            </div>

            {selectedTemplate.variables && selectedTemplate.variables.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Available Variables:</label>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.variables.map((variable) => (
                    <span 
                      key={variable}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {variable}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="text-xs text-gray-500">
              Created: {new Date(selectedTemplate.createdAt).toLocaleDateString()}
              {selectedTemplate.updatedAt !== selectedTemplate.createdAt && (
                <span> • Updated: {new Date(selectedTemplate.updatedAt).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TemplateSelector