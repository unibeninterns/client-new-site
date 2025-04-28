{/* Upload Section */}
<div className="mb-8">
<h2 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">Upload Section</h2>
<div>
  <label className="block text-sm font-medium text-gray-700 mb-3">
    Upload Short CV of Lead Researcher (Max 2 pages; PDF or DOC format) *
  </label>
  <div 
    className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${isDragging ? 'border-purple-500 bg-purple-50' : 'border-gray-300'} ${fileError ? 'border-red-300' : ''} border-dashed rounded-md`}
    onDragEnter={handleDragEnter}
    onDragOver={handleDragOver}
    onDragLeave={handleDragLeave}
    onDrop={handleDrop}
  >
    <div className="space-y-1 text-center">
      <Upload className={`mx-auto h-12 w-12 ${fileError ? 'text-red-400' : 'text-gray-400'}`} />
      <div className="flex text-sm text-gray-600">
        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500">
          <span>Upload a file</span>
          <input 
            id="file-upload" 
            name="file-upload" 
            type="file" 
            className="sr-only"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            ref={fileInputRef}
            required
          />
        </label>
        <p className="pl-1">or drag and drop</p>
      </div>
      <p className="text-xs text-gray-500">
        PDF or DOC up to 2MB (max 2 pages)
      </p>
      {formData.cvFile && (
        <p className="text-sm text-green-600 mt-2">
          File selected: {formData.cvFile.name}
        </p>
      )}
      {fileError && (
        <div className="flex items-center mt-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 mr-1" />
          {fileError}
        </div>
      )}
    </div>
  </div>
</div>
</div>

{/* Submit Button */}
<div className="mt-8 border-t pt-6">
<div className="flex justify-end">
  <button
    onClick={clearForm}
    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 mr-4"
  >
    Clear form
  </button>
  <button
    type="submit"
    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-800 hover:bg-purple-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
  >
    Submit Application
  </button>
</div>
</div>
</form>
</div>
</main>

{/* Footer */}
<footer className="bg-gray-100 mt-12">
<div className="container mx-auto px-4 py-6">
<p className="text-center text-sm text-gray-600">
© {new Date().getFullYear()} DRID UNIBEN. All rights reserved.
</p>
<p className="text-center text-xs text-gray-500 mt-1">
For technical support, please contact: <Link href='mailto:drid@uniben.edu' className='text-blue-500' title='send email'>drid@uniben.edu</Link>
</p>
</div>
</footer>
</div>
);
}