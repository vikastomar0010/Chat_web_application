import React,{useState} from 'react'
import {useDisclosure,Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,Button,
    IconButton,
    FormControl,
    Input,
    useToast,
    Box,TagLabel,TagCloseButton,
    Tag,} from "@chakra-ui/react"

    import {ViewIcon} from "@chakra-ui/icons"
import { Chatstate } from '../Context/Context'
import axios from 'axios'
import UserListItem from './UserListItem'
import { API_BASE_URL } from '../config';
function UpdateGroupModal({fetchAgain,setfetch,fetchmessage}) {
    const {user,selectedChat, setSelectedChat}=Chatstate()
    const toast=useToast()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [chatName, setchatName] = useState();
    const [search, setsearch] = useState();
    const [selectedUser, setselectedUser] = useState(); 
    const [searchResult, setsearchResult] = useState();
    const [Loading, setloading] = useState(false);
    const [createloading, setcreateloading] = useState(false);
   

    // search function
    const searchUser=async()=>{
         try{
          const config = {
            headers: {
              "Content-type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
          };
          const { data } = await axios.get(
            `${API_BASE_URL}/api/v1/users?search=${search}`,
            config
          );
          setsearchResult(data);
         } catch (err) {
          toast({
            title: "User Created Successfully",
            description: "Your Account has been creates",
            status: "success",
            duration: 5000,
            isClosable: true,
          });
        }
    }




    const RenameGroup=async()=>{
            try{ 
               const config={
                headers:{
                  "Content-type":"application/json",
                  Authorization:`Bearer ${user.token}`,
                },
               }

               const {data}=await axios.put(`${API_BASE_URL}/api/v1/chat/rename`,{groupId:selectedChat._id,newName:chatName},config)
               console.log("Rename Success")
               setSelectedChat(data)
               setfetch(!fetchAgain)
               onClose()
            }catch(err){
              toast({
                title: "Error 400",
                description: err.msg,
                status: "success",
                duration: 5000,
                isClosable: true,
              });
            }
             
    }
    const Addmemebers=async(user1)=>{
       if(selectedChat?.users?.find((u)=>u?._id===user1?._id)){
        toast({
          title: "User Already Exist",
          description: "The clicked user already in your group",
          status: "warning",
          duration: 5000,
          isClosable: true,
        }); 
        return
       }
      //  making the accessiblity to the admin only

      if(selectedChat.groupAdmin._id!==user._id){
        toast({
          title: "Only Admin Can add or remove",
          description: "Sorry but you don't have authority",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
        return
      }

           try{
           const config={
            headers:{
              "Content-type":"application/json",
              Authorization:`Bearer ${user.token}`
            }
           }
           const {data}= await axios.put(`${API_BASE_URL}/api/v1/chat/groupadd`,{groupId:selectedChat._id,userId:user1._id},config)
           console.log("Memeber added Successfully")
           setSelectedChat(data)
            setfetch(!fetchAgain)
            
           }catch(err){
            toast({
              title: "Error 400",
              description: err.msg,
              status: "success",
              duration: 5000,
              isClosable: true,
            });
           }
    }

  // remove user

  const removeuser=async(user2)=>{
    if(selectedChat.groupAdmin._id!==user._id){
      toast({
        title: "Only Admin Can add or remove",
        description: "Sorry but you don't have authority",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return
    }
    
      try{
        const config={
         headers:{
           "Content-type":"application/json",
           Authorization:`Bearer ${user.token}`
         }
        }
       const {data}= await axios.put(`${API_BASE_URL}/api/v1/chat/removeFgroup`,{groupId:selectedChat._id,userId:user2._id},config)
         console.log("Memeber Removed Successfully")
        setSelectedChat(data)
        fetchmessage()
         setfetch(!fetchAgain)
    }catch(err){
      toast({
        title: "Error 400",
        description: err.msg,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    }
  }
  const mistake=()=>{
    console.log("Hello mistake")
  }
  const mistake2=(para)=>{
    console.log({para})
  }
  return (
    <>
      <IconButton icon={<ViewIcon/>} onClick={onOpen}>Open Modal</IconButton>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Modal Title</ModalHeader>
          <ModalCloseButton />
          <ModalBody display="flex" flexDir="column" gap={3}>
            <Box display="flex" justifyContent="flex-start"  >
              {selectedChat.users.map((e)=>(
                <Tag 
                    size="sm"
                    key={e._id}
                    borderRadius="full"
                    variant="solid"
                    colorScheme="blue">
                  <TagLabel>{e.name}</TagLabel>{" "}
                  <TagCloseButton
                      onClick={() => {
                        removeuser(e)
                      }}
                    />
                </Tag>
              ))}
            </Box>
           <FormControl display="flex" gap={2}>
            <Input placeholder="Enter New Group Name" onChange={(e)=>{setchatName(e.target.value)}}/>
            <Button colorScheme='green' mr={3} onClick={RenameGroup} >
              Update
            </Button>
           </FormControl>
           {/* adding the new user */}
           <FormControl>
             <Input placeholder="Search for the user" onChange={(e)=>{setsearch(e.target.value);searchUser()}}/>
           </FormControl>
           {Loading ? (
              <div>Loading</div>
            ) : (
              searchResult
                ?.slice(0, 4)
                .map((e) => (
                  <UserListItem
                    key={e._id}
                    user={e}
                    handleFunction={() => Addmemebers(e)}
                  />
                ))
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={onClose} >
             close
            </Button>
       
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default UpdateGroupModal
