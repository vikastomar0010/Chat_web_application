import { Button, FormControl, FormLabel, Input, InputGroup, InputRightElement, VStack, useToast } from '@chakra-ui/react'
import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../config';

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const useTempAcc = () => {
        setEmail('alice@gmail.com');
        setPassword('1');
    }

    const submithandler = async () => {
        setLoading(true);
        if (!email || !password) {
            toast({
                title: 'Empty Fields',
                description: "Kindly fill all the fields",
                status: 'warning',
                duration: 2000,
                isClosable: true,
            });
            setLoading(false);
            return;
        }
        try {
            const config = {
                headers: { "Content-type": "application/json" }
            };
            const { data } = await axios.post(`${API_BASE_URL}/api/v1/users/login`, { email, password }, config);
            localStorage.setItem('userInfo', JSON.stringify(data));
            setLoading(false);
            navigate('/chats');
            toast({
                title: 'Logged In',
                description: "Your Account has been logged in Successfully",
                status: 'success',
                duration: 2000,
                isClosable: true,
            });
        } catch (err) {
            toast({
                title: 'Error Occurred',
                description: "Invalid Password",
                status: 'warning',
                duration: 2000,
                isClosable: true,
            });
            setLoading(false);
        }
    }

    return (
        <VStack>
            {/* email */}
            <FormControl id='email' isRequired>
                <FormLabel>
                    Email
                </FormLabel>
                <Input placeholder='Enter Your Email' value={email} onChange={(e) => { setEmail(e.target.value) }} />
            </FormControl>
            {/* password */}
            <FormControl id='Password' isRequired>
                <FormLabel>
                    Password
                </FormLabel>
                <InputGroup>
                    <Input placeholder='Password' type={show ? 'text' : 'password'} value={password} onChange={(e) => { setPassword(e.target.value) }} />
                    <InputRightElement width="4.5rem">
                        <Button h="1.75rem" size="sm" onClick={() => { setShow(!show) }}>{show ? 'Hide' : 'Show'}</Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>

            {/* btn */}
            <Button colorScheme='blue' width="100%" style={{ marginTop: 15 }} onClick={submithandler} isLoading={loading}>
                Log in
            </Button>
            <Button onClick={useTempAcc}>Use Guest</Button>
        </VStack>
    )
}

export default Login;
