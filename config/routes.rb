DedicedWebAlpha::Application.routes.draw do
  root :to => "Pages#home"
  
  match '/signup' => 'pages#signup'
  match '/@:username' => 'pages#userProfile'
end
