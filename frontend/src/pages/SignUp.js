import { Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, VStack,useToast } from '@chakra-ui/react'
import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../config';
function SignUp() {
    const [name,setName]=useState('')
    const [email,setemail]=useState('')
    const [password,setpassword]=useState('')
    const [confpassword, setconfpassword]=useState('')
    const [show, setshow]=useState(false)
    const [pic, setpic]=useState()
    const [loading,setloading]=useState(false)
    const toast=useToast()
    const navigate=useNavigate()
    // fn to read the image
    const PostImageDetail=(pics)=>{
            setloading(true)
            if(pics===undefined){
                toast({
                    title: 'Not Image',
                    description: "Kindly select an image",
                    status: 'warning',
                    duration: 2000,
                    isClosable: true,
                  })
                return;
            }
            if(pics.type==='image/png'||pics.type==='image/jpeg'){
                const data=new FormData()
                data.append('file',pics)
                data.append('upload_preset','chat-mern')
                data.append('cloud_name','dso053c1p')
                fetch('https://api.cloudinary.com/v1_1/dso053c1p/image/upload',{
                    method:'post',
                    body:data
                }).then((res)=>res.json())
                .then((data)=>{
                    
                    setpic(data.url.toString())
                    setloading(false)
                    
                }).catch((err)=>{console.log(err)})

            }
            else{
                toast({
                    title: 'Not Image',
                    description: "Kindly select an image",
                    status: 'warning',
                    duration: 2000,
                    isClosable: true,
                  })
                  setloading(false)
            }
    } 

    //fn for submission
    const submithandler=async()=>{
        setloading(true)
         if(!email||!password||!confpassword||!name){
            toast({
                title: 'Empyty Fields',
                description: "Kindly fill all the fields",
                status: 'warning',
                duration: 2000,
                isClosable: true,
              })
              return;
         }
         if(password!==confpassword){
            toast({
                title: 'Incorrect Confirm Password',
                description: "Kindly check the password again",
                status: 'warning',
                duration: 2000,
                isClosable: true,
              })
              return;
         }
         try{
            const config={
               headers:{ "Content-type":"application/json"}
             }
            //  remember to have this name,pic,email,password same name as in the Users.controller.js as we were getting
            //internal server error 500 when we were passing Name where as we were destructuring as name
             const {data}=await axios.post(`${API_BASE_URL}/api/v1/users`,{name,pic,email,password},config)
             
             toast({
                title: 'User Created Successfully',
                description: "Your Account has been creates",
                status: 'success',
                duration: 2000,
                isClosable: true,
              })
              localStorage.setItem('userInfo',JSON.stringify(data))
              setloading(false)
              window.location.href = '/chats';
              toast({
                title: 'Logged In',
                description: "Your Account has been logged in Successfully",
                status: 'success',
                duration: 2000,
                isClosable: true,
              })
         }
        catch(err){
              setloading(false)
            console.log(err)
        }



    }
  return (
    <VStack>
        <FormControl id='first-name' isRequired>
            <FormLabel >
                Name
            </FormLabel>
            <Input placeholder='Enter Your Name' onChange={(e)=>{setName(e.target.value)}}/>
        </FormControl>
        {/* email */}
        <FormControl id='email' isRequired>
            <FormLabel >
                Email
            </FormLabel>
            <Input placeholder='Enter Your Email'  onChange={(e)=>{setemail(e.target.value)}}/>
        </FormControl>
        {/* password */}
        <FormControl id='Password' isRequired>
            <FormLabel >
                Password
            </FormLabel>
            <InputGroup>
             <Input placeholder='Password' type={show?'text':'password'} onChange={(e)=>{setpassword(e.target.value)}}/>
             <InputRightElement width="4.5rem">
                <Button h="1.75rem" size="sm" onClick={()=>{setshow(!show)}}>{show?'Hide':'Show'}</Button>
             </InputRightElement>
             </InputGroup>
        </FormControl>
        {/* confpasswrod */}
        <FormControl id='confpassword' isRequired>
            <FormLabel >
                Confirm Password
            </FormLabel>
            <Input placeholder='Confirm Password' type='password' onChange={(e)=>{setconfpassword(e.target.value)}}/>
        </FormControl>
        {/* pic */}
        <FormControl>
            <FormLabel>Uploab Your Profile Photo</FormLabel>
            <Input type='file' p={1.5} accept='image/*' onChange={(e)=>{PostImageDetail(e.target.files[0])}}/>
        </FormControl>
        {/* btn */}
        <Button colorScheme='blue' width="100%" style={{marginTop:15}} onClick={submithandler} isLoading={loading}>
        Sign Up
        </Button>
       
    </VStack>
  )
}

export default SignUp
