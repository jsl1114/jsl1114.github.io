import React from 'react';
import {
  Html,
  Body,
  Head,
  Heading,
  Hr,
  Container,
  Preview,
  Section,
  Text,
  Tailwind,
  Img,
} from '@react-email/components';

export const ContactEmail = ({
  name="magic",
  message="magic",
}) => {
  return (
    <Html>
      <Head />
      <Preview>I have received your message</Preview>
      <Tailwind>
        <Body className="bg-white mx-auto font-sans">
          <Container className="mx-auto p-[20px] max-w-[465px] w-full">
            <Section className="mt-[16px]">
              <Img
                src="https://github.com/user-attachments/assets/9f45d956-8b9d-46ab-b245-0ac389a881f3"
                width="50"
                height="53"
                alt="Logo"
                className="my-0"
              />
            </Section>
            <Heading className="text-black text-[24px] font-normal p-0 my-[30px] mx-0">
              Thanks for reaching out
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Hello {name},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              I've received your message and will get back to you as soon as possible.
            </Text>
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              Your message:
            </Text>
            <Text className="text-black text-[14px] leading-[24px] text-left p-4 bg-gray-100">
              {message}
            </Text>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              Best regards,
              <br />
              Jason Liu
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ContactEmail;
