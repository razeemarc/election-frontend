'use client';

import React, { useState, useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { motion } from 'framer-motion';

import {

  Tabs,

  TabsContent,

  TabsList,

  TabsTrigger

} from '@/components/ui/tabs';

import {

  Card,

  CardContent,

  CardDescription,

  CardFooter,

  CardHeader,

  CardTitle

} from '@/components/ui/card';

import { Label } from '@/components/ui/label';

import { Input } from '@/components/ui/input';

import { Button } from '@/components/ui/button';

import { Separator } from '@/components/ui/separator';

import { useUserStore } from '@/store/userStore';

import { toast } from '@/components/ui/use-toast';

import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';



const AuthUI = () => {

  const router = useRouter();

  const login = useUserStore((state) => state.login);

  const [isLoading, setIsLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("signin");

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({

    email: '',

    password: '',

    name: ''

  });

  const [error, setError] = useState<string | null>(null);

  const [mounted, setMounted] = useState(false);



  // Handle hydration issues with animation

  useEffect(() => {

    setMounted(true);

  }, []);



  const handleChange = (e: { target: { name: any; value: any; }; }) => {

    const { name, value } = e.target;

    setFormData({

      ...formData,

      [name]: value,

    });

    if (error) setError(null);

  };



  const togglePasswordVisibility = () => {

    setShowPassword(!showPassword);

  };



  const handleSubmit = async (e: { preventDefault: () => void; }) => {

    e.preventDefault();

    setIsLoading(true);

    setError(null);



    const { email, password, name } = formData;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    let endpoint = '/api/auth/login';

    let payload: any = { email, password };



    if (activeTab === "signup") {

      endpoint = '/api/auth/signup';

      // FIXED: Include name in the signup payload

      payload = {

        name,  // Added name field

        email,

        password,

      };

    }



    try {

      const response = await fetch(`${apiUrl}${endpoint}`, {

        method: 'POST',

        headers: {

          'Content-Type': 'application/json',

          'Accept': 'application/json'

        },

        credentials: 'include',

        body: JSON.stringify(payload),

      });



      const data = await response.json();

      setIsLoading(false);



      if (response.ok) {

        login(data.user, data.token);

        

        toast({

          title: "Success",

          description: data.message || "Authentication successful",

          variant: "default",

        });

        

        router.push('/dashboard');

      } else {

        setError(data.message || 'Something went wrong!');

        toast({

          title: "Error",

          description: data.message || 'Something went wrong!',

          variant: "destructive",

        });

      }

    } catch (error) {

      console.error('Auth error:', error);

      setIsLoading(false);

      setError('An error occurred. Please try again later.');

      toast({

        title: "Error",

        description: 'An error occurred. Please try again later.',

        variant: "destructive",

      });

    }

  };



  if (!mounted) {

    return null;

  }



  return (

    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">

      <motion.div

        initial={{ opacity: 0, y: 20 }}

        animate={{ opacity: 1, y: 0 }}

        transition={{ duration: 0.5 }}

        className="w-full max-w-md"

      >

        <Card className="border-none shadow-xl bg-white/90 backdrop-blur-sm">

          <CardHeader className="space-y-2 pb-6">

            <motion.div

              initial={{ scale: 0.95 }}

              animate={{ scale: 1 }}

              transition={{ duration: 0.3 }}

            >

              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">

                <Lock className="h-8 w-8 text-white" />

              </div>

            </motion.div>

            <CardTitle className="text-2xl font-bold text-center text-gray-800">

              {activeTab === "signin" ? "Welcome back" : "Join us today"}

            </CardTitle>

            <CardDescription className="text-center text-gray-600">

              {activeTab === "signin"

                ? "Sign in to your account to continue"

                : "Create an account to get started"}

            </CardDescription>

          </CardHeader>



          <Tabs 

            value={activeTab} 

            onValueChange={setActiveTab} 

            className="w-full"

          >

            <TabsList className="grid grid-cols-2 mx-6 mb-4">

              <TabsTrigger 

                value="signin"

                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white"

              >

                Sign In

              </TabsTrigger>

              <TabsTrigger 

                value="signup"

                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white"

              >

                Sign Up

              </TabsTrigger>

            </TabsList>

            

            <CardContent className="pt-2 pb-4">

              {error && (

                <motion.div

                  initial={{ opacity: 0, y: -10 }}

                  animate={{ opacity: 1, y: 0 }}

                  className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm"

                >

                  {error}

                </motion.div>

              )}



              <TabsContent value="signin">

                <form onSubmit={handleSubmit} className="space-y-4">

                  <div className="space-y-2">

                    <Label htmlFor="email" className="text-gray-700">Email</Label>

                    <div className="relative">

                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />

                      <Input

                        id="email"

                        name="email"

                        type="email"

                        placeholder="name@example.com"

                        value={formData.email}

                        onChange={handleChange}

                        className="pl-10 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"

                        required

                      />

                    </div>

                  </div>

                  <div className="space-y-2">

                    <div className="flex items-center justify-between">

                      <Label htmlFor="password" className="text-gray-700">Password</Label>

                      <a href="#" className="text-sm text-blue-600 hover:text-blue-500 font-medium">

                        Forgot password?

                      </a>

                    </div>

                    <div className="relative">

                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />

                      <Input

                        id="password"

                        name="password"

                        type={showPassword ? "text" : "password"}

                        placeholder="••••••••"

                        value={formData.password}

                        onChange={handleChange}

                        className="pl-10 pr-10 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"

                        required

                      />

                      <button

                        type="button"

                        onClick={togglePasswordVisibility}

                        className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"

                      >

                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}

                      </button>

                    </div>

                  </div>

               

                  <Button 

                    type="submit" 

                    className="w-full h-11 mt-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium" 

                    disabled={isLoading}

                  >

                    {isLoading ? (

                      <div className="flex items-center justify-center">

                        <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>

                        <span>Signing in...</span>

                      </div>

                    ) : "Sign In"}

                  </Button>

                </form>

              </TabsContent>



              <TabsContent value="signup">

                <form onSubmit={handleSubmit} className="space-y-4">

                  <div className="space-y-2">

                    <Label htmlFor="name" className="text-gray-700">Full Name</Label>

                    <div className="relative">

                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />

                      <Input

                        id="name"

                        name="name"

                        placeholder="John Doe"

                        value={formData.name}

                        onChange={handleChange}

                        className="pl-10 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"

                        required

                      />

                    </div>

                  </div>



                  <div className="space-y-2">

                    <Label htmlFor="email-signup" className="text-gray-700">Email</Label>

                    <div className="relative">

                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />

                      <Input

                        id="email-signup"

                        name="email"

                        type="email"

                        placeholder="name@example.com"

                        value={formData.email}

                        onChange={handleChange}

                        className="pl-10 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"

                        required

                      />

                    </div>

                  </div>

                  <div className="space-y-2">

                    <Label htmlFor="password-signup" className="text-gray-700">Password</Label>

                    <div className="relative">

                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />

                      <Input

                        id="password-signup"

                        name="password"

                        type={showPassword ? "text" : "password"}

                        placeholder="••••••••"

                        value={formData.password}

                        onChange={handleChange}

                        className="pl-10 pr-10 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"

                        required

                      />

                      <button

                        type="button"

                        onClick={togglePasswordVisibility}

                        className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"

                      >

                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}

                      </button>

                    </div>

                  </div>



                  <Button 

                    type="submit" 

                    className="w-full h-11 mt-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium" 

                    disabled={isLoading}

                  >

                    {isLoading ? (

                      <div className="flex items-center justify-center">

                        <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>

                        <span>Creating account...</span>

                      </div>

                    ) : "Create Account"}

                  </Button>

                </form>

              </TabsContent>

            </CardContent>



            <CardFooter className="flex flex-col px-6 py-4 pt-0">

              <div className="relative w-full my-4">

                {/* <div className="absolute inset-0 flex items-center">

                  <Separator className="w-full" />

                </div> */}

               

              </div>

              

              <p className="text-center text-sm text-gray-600 ">

                {activeTab === "signin" ? (

                  <>

                    Don't have an account?{" "}

                    <button

                      type="button"

                      onClick={() => {

                        setActiveTab("signup");

                        setError(null);

                      }}

                      className="text-blue-600 hover:text-blue-500 font-medium hover:underline"

                    >

                      Create one

                    </button>

                  </>

                ) : (

                  <>

                    Already have an account?{" "}

                    <button

                      type="button"

                      onClick={() => {

                        setActiveTab("signin");

                        setError(null);

                      }}

                      className="text-blue-600 hover:text-blue-500 font-medium hover:underline"

                    >

                      Sign in

                    </button>

                  </>

                )}

              </p>

            </CardFooter>

          </Tabs>

        </Card>

        

        <p className="text-center text-xs text-gray-500 mt-8">

          By continuing, you agree to our {" "}

          <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and {" "}

          <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.

        </p>

      </motion.div>

    </div>

  );

};



export default AuthUI;