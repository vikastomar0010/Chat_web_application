import { ViewIcon } from "@chakra-ui/icons";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  IconButton,
  Text,
  Image,
  Input,
} from "@chakra-ui/react";
import { useState } from "react";
import axios from "axios";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import { Chatstate } from "../Context/Context";
function ImageModal({ docfn, children }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [avatar,setavatar]=useState()
  const [displayimg,setdisplayimg]=useState(null)

   const {user,selectedChat}=Chatstate()
     const closeModal=()=>{
        onClose()       
        setavatar(null) 
        setdisplayimg(null)
 }
 // uploading image
 // it was just the api check for debugging error associated here 
//  const docUploader = async () => {
//   try {
//       const formData = new FormData();
//       formData.append('avatar', avatar);
//       console.log("FormData:", formData); // Log the FormData here
//       const config = {
//           headers: {
//               "Content-Type": "multipart/form-data",     // this line was making issue as i was defining that content-type was normal but here i was using form-data
//           }
//       }
//       const { data } = await axios.post("http://localhost:5000/api/v1/message/i", formData, config);
//       console.log(data);
//   } catch (error) {
//       console.log(error);
//   }
// }

// now doing real part 
const docpass = () => {
  if (!avatar) return;

  docfn(avatar);   
  onClose();
  setavatar(null);
  setdisplayimg(null);
};
// displaying the selected image 
const imagehandler=(e)=>{
  setavatar(e.target.files[0])
  const file= e.target.files[0]
  if(file){
    const reader= new FileReader()
    reader.onload=()=>{
      setdisplayimg(reader.result)
    }
    reader.readAsDataURL(file)
  }
}

   
  return (
    <>
      {children ? (
        <span onClick={onOpen}>{children}</span>
      ) : (
        <IconButton d={{ base: "flex" }} icon={<ViewIcon />} onClick={onOpen} />
      )}
      <Modal size="lg" closeOnOverlayClick={false}  onClose={onClose} isOpen={isOpen} isCentered >
        <ModalOverlay />
        <ModalContent h="510px" >
          <ModalHeader
            fontSize="20px"
            fontFamily="Work sans"
            display="flex"
            justifyContent="center"
          >
            File Upload
          </ModalHeader>
          <ModalCloseButton h={7} w={7}  onClick={closeModal}/>
          <ModalBody display="flex" flexDir="column" alignItems="center" gap={2}>
            <Input type="file" accept="image/png, image/gif, image/jpeg" onChange={imagehandler}/>
            {displayimg && <Image src={displayimg} maxH="300px" maxW="350px" />}
          
          </ModalBody>
          <ModalFooter gap={4}>
          {/* displaying send icon only if image is selected */}
        { displayimg&& <FontAwesomeIcon size="2x"  icon={faPaperPlane} onClick={docpass}/>}
            <Button onClick={closeModal}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default ImageModal;
