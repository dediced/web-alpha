DedicedWebAlpha::Application.routes.draw do
  root :to => "Pages#home"
  
  match '/signup' => 'pages#signup'
  match '/@:username' => 'pages#userProfile'
  match '/links/:linkname' => 'pages#linkProfile'
end
