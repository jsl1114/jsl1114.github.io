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

export const NotificationEmail = ({
  name="not entered",
  email="not entered",
  message="not entered",
}) => {
  return (
    <Html>
      <Head />
      <Preview>New message from {name}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="my-[40px] mx-auto p-[20px] max-w-[465px] w-full">
            <Section className="mt-[32px]">
              <Img
                src="https://github.com/user-attachments/assets/9f45d956-8b9d-46ab-b245-0ac389a881f3"
                width="50"
                height="53"
                alt="Logo"
                className="my-0"
              />
            </Section>
            <Heading className="text-black text-[24px] font-normal p-0 my-[30px] mx-0">
              New Contact Form Submission
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              You have received a new message from <strong>{name}</strong> ({email}).
            </Text>
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              Message content:
            </Text>
            <Text className="text-black text-[14px] leading-[24px] p-4 bg-gray-100">
              {message}
            </Text>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              Sent from your portfolio website.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default NotificationEmail;
