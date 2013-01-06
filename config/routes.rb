DedicedWebAlpha::Application.routes.draw do
  root :to => "Pages#home"
  
  match '/signup' => 'pages#signup'
end
