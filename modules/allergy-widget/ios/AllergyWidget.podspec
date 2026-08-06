Pod::Spec.new do |s|
  s.name           = 'AllergyWidget'
  s.version        = '1.0.0'
  s.summary        = 'Widget data bridge for AllergyGuard'
  s.description    = 'Writes reminder data to the shared App Group and reloads the widget.'
  s.author         = ''
  s.homepage       = 'https://docs.expo.dev'
  s.license        = 'MIT'
  s.platforms      = { :ios => '15.1' }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
