import { useState, useEffect } from "react";
import type { ComponentType } from "react";
import { BookOpen, Award, TrendingUp, Lock, Eye, Shield, UserX, AlertTriangle, CheckCircle2, ChevronRight, ChevronLeft, X, Play, Smartphone, Wifi, MessageCircle, Camera, Mail, Globe, Heart, Users, HelpCircle, Lightbulb, Target, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Lesson {
  id: string;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  duration: string;
  completed: boolean;
  category: string;
  content: LessonContent[];
  quiz: QuizQuestion[];
}

interface LessonContent {
  title: string;
  text: string;
  tips?: string[];
  warning?: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const Learn = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState("lessons");

  useEffect(() => {
    if (!loading && !user) {
      toast.error("Please log in to track your progress");
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProgress();
    }
  }, [user]);

  const fetchProgress = async () => {
    const { data, error } = await supabase
      .from("lesson_progress")
      .select("lesson_id")
      .eq("completed", true);

    if (error) {
      console.error("Failed to fetch progress:", error);
    } else {
      setCompletedLessons(data?.map(p => p.lesson_id) || []);
    }
  };

  const handleStartLesson = (lessonId: string) => {
    setActiveLessonId(lessonId);
    setCurrentSlide(0);
    setShowQuiz(false);
    setQuizAnswers({});
    setQuizSubmitted(false);
  };

  const handleCloseLesson = () => {
    setActiveLessonId(null);
    setCurrentSlide(0);
    setShowQuiz(false);
    setQuizAnswers({});
    setQuizSubmitted(false);
  };

  const handleCompleteLesson = async (lessonId: string) => {
    if (!user || completedLessons.includes(lessonId)) {
      handleCloseLesson();
      return;
    }

    const { error } = await supabase.from("lesson_progress").upsert({
      user_id: user.id,
      lesson_id: lessonId,
      completed: true,
      completed_at: new Date().toISOString(),
    });

    if (error) {
      toast.error("Failed to save progress");
    } else {
      setCompletedLessons([...completedLessons, lessonId]);
      
      const newCount = completedLessons.length + 1;
      if (newCount === 1) {
        await awardBadge("First Steps");
      } else if (newCount === 3) {
        await awardBadge("Safety Scholar");
      } else if (newCount === 6) {
        await awardBadge("Digital Guardian");
      } else if (newCount === 9) {
        await awardBadge("Safety Expert");
      }
      
      toast.success("🎉 Lesson completed!");
    }
    handleCloseLesson();
  };

  const awardBadge = async (badgeName: string) => {
    if (!user) return;
    
    const { error } = await supabase.from("user_badges").upsert({
      user_id: user.id,
      badge_name: badgeName,
    });

    if (!error) {
      toast.success(`🏆 Badge earned: ${badgeName}!`);
    }
  };

  const handleQuizSubmit = () => {
    setQuizSubmitted(true);
    const activeLesson = lessons.find(l => l.id === activeLessonId);
    if (!activeLesson) return;
    
    const correctAnswers = activeLesson.quiz.filter(
      (q, i) => quizAnswers[i] === q.correctIndex
    ).length;
    
    const percentage = (correctAnswers / activeLesson.quiz.length) * 100;
    
    if (percentage >= 70) {
      toast.success(`Great job! You scored ${correctAnswers}/${activeLesson.quiz.length}`);
    } else {
      toast.info(`You scored ${correctAnswers}/${activeLesson.quiz.length}. Review the material and try again!`);
    }
  };

  const lessons: Lesson[] = [
    {
      id: "1",
      title: "Recognizing Digital Violence",
      description: "Learn to identify cyberbullying, harassment, and online threats",
      icon: AlertTriangle,
      duration: "8 min",
      completed: false,
      category: "Safety Basics",
      content: [
        {
          title: "What is Digital Violence?",
          text: "Digital violence, also known as online violence or cyber violence, refers to any act of violence committed, assisted, or aggravated by the use of digital technology. This includes mobile phones, the internet, social media platforms, and gaming platforms. It can happen to anyone but disproportionately affects women and girls.",
          tips: [
            "Digital violence is real violence - it has real impacts on mental health",
            "It can happen on any platform: social media, messaging apps, games, email",
            "The anonymity of the internet can make perpetrators bolder"
          ]
        },
        {
          title: "Types of Digital Violence",
          text: "Understanding the different forms of digital violence helps you recognize when it's happening to you or someone you know. Common types include: Cyberbullying (repeated harassment online), Cyberstalking (monitoring and tracking someone's online activities), Doxing (sharing private information publicly), Image-based abuse (sharing intimate images without consent), Online harassment (threatening or abusive messages), and Sextortion (blackmail using intimate content).",
          warning: "If you're experiencing any form of digital violence, know that it's not your fault and help is available."
        },
        {
          title: "Warning Signs to Watch For",
          text: "Early recognition of digital violence can help you protect yourself. Watch for these warning signs: Someone sends you repeated unwanted messages even after you ask them to stop, You receive threats or intimidating messages, Someone shares your private photos or information without permission, You're being excluded or humiliated in online groups, Someone creates fake profiles to contact you, or Your accounts get hacked or someone tries to access them.",
          tips: [
            "Trust your instincts - if something feels wrong, it probably is",
            "Keep screenshots of concerning messages as evidence",
            "Don't engage with harassers - it often escalates the situation"
          ]
        },
        {
          title: "Impact on Mental Health",
          text: "Digital violence can have serious effects on your wellbeing, including: anxiety and depression, fear and constant worry, difficulty sleeping, withdrawal from social activities, loss of self-esteem, and in severe cases, thoughts of self-harm. Remember that seeking help is a sign of strength, not weakness.",
          tips: [
            "Talk to someone you trust about what you're experiencing",
            "Consider speaking with a mental health professional",
            "Practice self-care and limit your exposure to toxic online spaces"
          ]
        }
      ],
      quiz: [
        {
          question: "Which of the following is NOT a form of digital violence?",
          options: ["Sending a friend request", "Repeatedly messaging someone after they've asked you to stop", "Sharing someone's private photos without consent", "Creating fake profiles to contact someone"],
          correctIndex: 0,
          explanation: "Sending a friend request is a normal social media activity. The other options are all forms of digital violence."
        },
        {
          question: "What should you do if you receive threatening messages online?",
          options: ["Respond with similar threats", "Delete the messages immediately", "Screenshot the messages and report to the platform", "Share the messages publicly to shame the sender"],
          correctIndex: 2,
          explanation: "Taking screenshots preserves evidence, and reporting to the platform helps them take action against the harasser."
        },
        {
          question: "Why is digital violence particularly harmful?",
          options: ["It only happens online so it's not real", "It can happen 24/7 and follow you everywhere", "It's always easy to identify the perpetrator", "It only affects teenagers"],
          correctIndex: 1,
          explanation: "Digital violence can happen around the clock and reach you anywhere you have an internet connection, making it difficult to escape."
        }
      ]
    },
    {
      id: "2",
      title: "Protecting Your Digital Identity",
      description: "Secure your personal information and online presence",
      icon: Lock,
      duration: "10 min",
      completed: false,
      category: "Privacy",
      content: [
        {
          title: "What is Your Digital Identity?",
          text: "Your digital identity is the sum of all information about you that exists online. This includes your social media profiles, email accounts, online purchases, search history, photos, and any data collected by websites and apps. Protecting your digital identity means controlling what information is available and who can access it.",
          tips: [
            "Google yourself regularly to see what information is publicly available",
            "Remember that once something is posted online, it can be difficult to fully remove",
            "Your digital identity affects your real-world reputation and opportunities"
          ]
        },
        {
          title: "Creating Strong Passwords",
          text: "Strong passwords are your first line of defense. A good password should be: at least 12 characters long, include uppercase and lowercase letters, numbers, and special characters, not contain personal information like birthdays or names, and be unique for each account. Consider using a password manager to keep track of your passwords securely.",
          tips: [
            "Use a passphrase: combine random words like 'Purple-Elephant-Dancing-Rain2024!'",
            "Never share your passwords with anyone",
            "Change passwords immediately if you suspect a breach"
          ],
          warning: "Never use the same password across multiple accounts. If one account is compromised, all your accounts become vulnerable."
        },
        {
          title: "Two-Factor Authentication (2FA)",
          text: "Two-factor authentication adds an extra layer of security by requiring two forms of verification. Even if someone gets your password, they can't access your account without the second factor. Common types include: SMS codes sent to your phone, Authenticator apps that generate time-based codes, Hardware security keys, and Biometric verification (fingerprint or face).",
          tips: [
            "Enable 2FA on all accounts that offer it, especially email and banking",
            "Authenticator apps are more secure than SMS codes",
            "Keep backup codes in a safe place in case you lose your phone"
          ]
        },
        {
          title: "Managing Personal Information Online",
          text: "Be mindful of what personal information you share online. Avoid posting: your full address, phone number, workplace details, travel plans in real-time, photos with identifiable locations, or financial information. Regularly review privacy settings on all your accounts and limit what strangers can see about you.",
          tips: [
            "Review and clean up old posts that reveal too much information",
            "Be cautious about location tagging in photos",
            "Think twice before participating in viral social media challenges that ask for personal info"
          ]
        }
      ],
      quiz: [
        {
          question: "What makes a strong password?",
          options: ["Your pet's name", "Your birthday in numbers", "A mix of letters, numbers, and symbols that's at least 12 characters", "The word 'password123'"],
          correctIndex: 2,
          explanation: "Strong passwords should be at least 12 characters and include a mix of uppercase, lowercase, numbers, and special characters."
        },
        {
          question: "What is two-factor authentication?",
          options: ["Using two different passwords", "Having two email accounts", "Requiring two forms of verification to access an account", "Logging in twice"],
          correctIndex: 2,
          explanation: "Two-factor authentication requires something you know (password) plus something you have (like your phone) to verify your identity."
        },
        {
          question: "Which information should you avoid sharing publicly online?",
          options: ["Your favorite music", "Your home address", "Your opinion on a movie", "Your favorite color"],
          correctIndex: 1,
          explanation: "Personal information like your home address can be used by bad actors to find you in person."
        }
      ]
    },
    {
      id: "3",
      title: "Spotting Impersonation & Catfishing",
      description: "Identify fake profiles and protect yourself from fraud",
      icon: UserX,
      duration: "8 min",
      completed: false,
      category: "Safety Basics",
      content: [
        {
          title: "What is Catfishing?",
          text: "Catfishing is when someone creates a fake online identity to deceive others. They often use stolen photos and fabricate entire life stories. Catfishers may be seeking emotional connections, money, or personal information. This type of deception has become increasingly common on social media and dating platforms.",
          tips: [
            "Catfishing is emotional manipulation and can cause real psychological harm",
            "Anyone can be a target - it's not a reflection on you",
            "Trust is built over time, not through words alone"
          ]
        },
        {
          title: "Red Flags to Watch For",
          text: "Several warning signs can indicate a fake profile: The person refuses video calls or in-person meetings, Their photos look professional or like model shots, The account is new with few friends or connections, Their story has inconsistencies, They quickly profess love or deep feelings, They ask for money or gift cards, and Their life story seems too perfect or dramatic.",
          warning: "If someone you've only met online asks for money, this is almost always a scam, regardless of the reason they give."
        },
        {
          title: "How to Verify Identity",
          text: "Before trusting someone online, take steps to verify their identity: Do a reverse image search on their photos using Google Images or TinEye, Look for them on multiple platforms - real people usually have consistent presence, Request a video call - most catfishers will avoid this, Check if their friends list seems genuine, and Look for inconsistencies in their stories over time.",
          tips: [
            "Real relationships can wait for verification - genuine people understand",
            "If they get angry when you ask for verification, that's a red flag",
            "Cross-reference their claims with public records when possible"
          ]
        },
        {
          title: "Protecting Yourself",
          text: "Stay safe by: Never sending money to someone you haven't met in person, Not sharing intimate photos with online-only contacts, Taking things slowly in online relationships, Trusting your instincts when something feels off, Telling trusted friends about your online relationships, and Meeting in public places if you decide to meet in person.",
          tips: [
            "If meeting someone from online, always tell someone where you're going",
            "Choose a public place for first meetings and arrange your own transportation",
            "Don't share sensitive information until you've built genuine trust"
          ]
        }
      ],
      quiz: [
        {
          question: "What is a major red flag that someone might be catfishing you?",
          options: ["They have mutual friends with you", "They refuse video calls and always have excuses", "They share their daily life on social media", "They respond to messages at various times"],
          correctIndex: 1,
          explanation: "Catfishers typically avoid video calls because they can't show their real face, so they make excuses."
        },
        {
          question: "How can you verify if someone's profile photos are real?",
          options: ["Ask them if the photos are real", "Use reverse image search tools", "Assume all photos online are real", "It's impossible to verify photos"],
          correctIndex: 1,
          explanation: "Reverse image search tools like Google Images or TinEye can show you where else a photo appears online."
        },
        {
          question: "What should you do if someone you've only met online asks for money?",
          options: ["Send it if they seem trustworthy", "Send a smaller amount first to test them", "Never send money to someone you haven't met in person", "Ask them to pay you back double"],
          correctIndex: 2,
          explanation: "This is almost always a scam. Legitimate people you meet online won't ask for money."
        }
      ]
    },
    {
      id: "4",
      title: "Social Media Security",
      description: "Privacy settings, safe sharing, and boundary setting",
      icon: Eye,
      duration: "10 min",
      completed: false,
      category: "Privacy",
      content: [
        {
          title: "Understanding Privacy Settings",
          text: "Every social media platform has privacy settings that control who can see your content and information. Take time to review and customize these settings for each platform you use. Key settings to configure include: who can see your posts (public, friends only, custom lists), who can send you friend requests or messages, who can see your location, and what information appears on your profile.",
          tips: [
            "Schedule a monthly privacy checkup for all your accounts",
            "Platforms often change their settings - stay updated",
            "When in doubt, choose the most restrictive setting"
          ]
        },
        {
          title: "Platform-Specific Tips",
          text: "Each platform has unique privacy concerns: On Facebook, review your Timeline settings and limit who can post on your wall. On Instagram, consider making your account private and reviewing your tagged photos. On Twitter/X, you can protect your tweets so only followers see them. On TikTok, be mindful of the algorithm showing your content to strangers. On WhatsApp, control who can see your profile picture and status.",
          tips: [
            "Turn off location services for social media apps unless necessary",
            "Regularly review which apps have access to your social media accounts",
            "Be cautious about logging into other sites using social media credentials"
          ]
        },
        {
          title: "Safe Sharing Practices",
          text: "Think before you post by asking yourself: Would I be comfortable if this was seen by family, employers, or strangers? Does this reveal information that could be used against me? Am I sharing someone else's information without their consent? Could this post identify my location or routine? Will I still want this online in 5 years?",
          warning: "Screenshots last forever. Even disappearing stories can be captured and shared."
        },
        {
          title: "Setting Online Boundaries",
          text: "Healthy boundaries protect your digital wellbeing: Limit screen time and set specific times to check social media, Mute or unfollow accounts that make you feel bad, Block users who are harassing or making you uncomfortable, Don't feel obligated to accept all friend requests, and It's okay to ignore messages or not respond immediately.",
          tips: [
            "Use the mute feature liberally - people won't know",
            "Blocking is a tool for self-protection, not rudeness",
            "You don't owe anyone your attention or engagement"
          ]
        }
      ],
      quiz: [
        {
          question: "How often should you review your social media privacy settings?",
          options: ["Only when you first create an account", "Never - default settings are fine", "Regularly, as platforms update their settings", "Only after a security incident"],
          correctIndex: 2,
          explanation: "Social media platforms frequently update their privacy settings and policies, so regular reviews are essential."
        },
        {
          question: "What should you consider before posting on social media?",
          options: ["Only how many likes it might get", "Whether the content could harm you now or in the future", "Nothing - social media is just for fun", "Only if your friends will see it"],
          correctIndex: 1,
          explanation: "Posts can have long-term consequences for your reputation and safety, so think carefully before posting."
        },
        {
          question: "Is it okay to block someone who makes you uncomfortable online?",
          options: ["No, it's rude", "Only if they're a stranger", "Yes, blocking is a valid tool for self-protection", "Only with platform permission"],
          correctIndex: 2,
          explanation: "Blocking is a legitimate privacy and safety tool. You have every right to protect your online space."
        }
      ]
    },
    {
      id: "5",
      title: "Responding to Online Threats",
      description: "Document, report, and get help when facing harassment",
      icon: Shield,
      duration: "12 min",
      completed: false,
      category: "Response",
      content: [
        {
          title: "Don't Engage, Document",
          text: "When facing online harassment, your first instinct might be to respond or defend yourself. However, engaging with harassers often escalates the situation. Instead, focus on documenting everything: Take screenshots of all harassment including dates and usernames, Save URLs of threatening posts or profiles, Record any offline incidents related to online harassment, Keep a log with dates, times, and descriptions, and Store evidence in a safe place like the Evidence Locker feature.",
          tips: [
            "Use your phone's built-in screenshot tools",
            "Include the full URL and date in your documentation",
            "Back up evidence in multiple locations"
          ]
        },
        {
          title: "Reporting to Platforms",
          text: "Every social media platform has reporting mechanisms. Report harassment through the platform's official channels - this creates a record and may result in action against the harasser. When reporting: be specific about which community guidelines were violated, include all relevant evidence, report each incident separately for serious situations, and follow up if you don't receive a response.",
          tips: [
            "Familiarize yourself with each platform's reporting process before you need it",
            "Keep records of your reports and any responses",
            "If the platform doesn't respond, escalate or report multiple times"
          ],
          warning: "Platform responses can be slow or inadequate. Don't rely solely on platforms for your safety."
        },
        {
          title: "When to Involve Authorities",
          text: "Some situations require law enforcement involvement. Contact police if you experience: direct threats of physical violence, stalking (online or offline), extortion or blackmail, non-consensual sharing of intimate images, hacking of your accounts, or if you fear for your physical safety. In Kenya, you can report cybercrimes to the Directorate of Criminal Investigations (DCI) Cyber Crime Unit.",
          tips: [
            "Keep all evidence organized and ready to share with authorities",
            "You can file a report even if you're not sure if action will be taken",
            "Consider consulting with a lawyer for serious cases"
          ]
        },
        {
          title: "Building Your Support Network",
          text: "You don't have to face online harassment alone. Build a support network by: Telling trusted friends or family members what's happening, Joining support groups for survivors of online harassment, Connecting with organizations that help victims of digital violence, Seeking professional mental health support if needed, and Using platforms like HERA SafeSpace to find resources and community.",
          tips: [
            "Talking about harassment can help reduce its psychological impact",
            "Support groups can provide practical advice from others who've experienced similar situations",
            "Remember: seeking help is a sign of strength"
          ]
        }
      ],
      quiz: [
        {
          question: "What should be your first response to online harassment?",
          options: ["Respond with insults", "Engage in a debate", "Document and avoid engaging", "Delete all your accounts"],
          correctIndex: 2,
          explanation: "Documenting harassment provides evidence while not engaging prevents escalation."
        },
        {
          question: "When should you involve law enforcement?",
          options: ["For any mean comment", "Only for physical threats or serious crimes", "Never - police can't help with online issues", "Only if the harasser is someone you know"],
          correctIndex: 1,
          explanation: "Law enforcement should be contacted for serious threats, stalking, blackmail, or when you fear for your safety."
        },
        {
          question: "Why is having a support network important when dealing with online harassment?",
          options: ["They can respond to harassers for you", "It helps reduce psychological impact and provides practical help", "It's not important at all", "Only for legal reasons"],
          correctIndex: 1,
          explanation: "A support network provides emotional support, practical advice, and helps reduce the isolation that harassment can cause."
        }
      ]
    },
    {
      id: "6",
      title: "Safe Online Communication",
      description: "Protect yourself in messages, emails, and video calls",
      icon: MessageCircle,
      duration: "8 min",
      completed: false,
      category: "Communication",
      content: [
        {
          title: "Email Safety",
          text: "Email is a common vector for scams and attacks. Practice email safety by: Never clicking links in suspicious emails, Verifying sender addresses carefully (scammers use similar-looking addresses), Not opening attachments from unknown senders, Being wary of urgent requests for personal information, Using different email addresses for different purposes.",
          tips: [
            "Hover over links to see the actual URL before clicking",
            "When in doubt, contact the supposed sender through a known channel",
            "Use email filtering to catch spam and phishing attempts"
          ],
          warning: "Legitimate organizations will never ask for passwords or sensitive information via email."
        },
        {
          title: "Messaging App Security",
          text: "Choose messaging apps with strong security features: End-to-end encryption (like Signal or WhatsApp) means only you and the recipient can read messages, Disappearing messages add an extra layer of privacy, Two-factor authentication protects your account, Be cautious of messages from unknown numbers, and Review who can add you to groups.",
          tips: [
            "Signal is considered one of the most secure messaging apps",
            "Even encrypted messages can be screenshotted by the recipient",
            "Regularly review and clean up old conversations"
          ]
        },
        {
          title: "Video Call Safety",
          text: "Video calls require additional safety considerations: Be aware of your background - it can reveal personal information, Check who is in the room with you before sharing sensitive topics, Use virtual backgrounds when appropriate, Enable waiting rooms for meetings you host, Don't accept video calls from unknown contacts, and Be aware that calls could be recorded without your knowledge.",
          tips: [
            "Test your video setup before important calls",
            "Use the mute button when not speaking to prevent accidental audio sharing",
            "Consider using headphones for private conversations"
          ]
        },
        {
          title: "Recognizing Phishing",
          text: "Phishing attempts try to trick you into revealing personal information. Watch for: Messages creating urgency or fear, Requests for passwords or financial information, Links that don't match the supposed sender, Poor spelling and grammar, Offers that seem too good to be true, and Requests to verify account information.",
          tips: [
            "Take time to think before acting on urgent-sounding messages",
            "Verify requests through official channels",
            "Report phishing attempts to help protect others"
          ]
        }
      ],
      quiz: [
        {
          question: "What is a sign of a phishing email?",
          options: ["It comes from a known contact", "It creates urgency and asks for personal information", "It has a professional signature", "It's sent during business hours"],
          correctIndex: 1,
          explanation: "Phishing emails often create false urgency to pressure you into acting quickly without thinking."
        },
        {
          question: "What does end-to-end encryption mean?",
          options: ["Your messages are stored forever", "Only you and the recipient can read the messages", "The app company can read your messages", "Messages are sent instantly"],
          correctIndex: 1,
          explanation: "End-to-end encryption ensures that messages can only be read by the sender and intended recipient."
        },
        {
          question: "What should you be aware of during video calls?",
          options: ["Only your face", "Your background and who else is present", "Only the lighting", "Nothing special is needed"],
          correctIndex: 1,
          explanation: "Your background can reveal personal information, and others in the room could overhear sensitive conversations."
        }
      ]
    },
    {
      id: "7",
      title: "Device Security Essentials",
      description: "Secure your phone, computer, and other devices",
      icon: Smartphone,
      duration: "10 min",
      completed: false,
      category: "Technical",
      content: [
        {
          title: "Phone Security Basics",
          text: "Your phone contains vast amounts of personal information. Protect it by: Using a strong passcode (avoid simple patterns or birthdays), Enabling biometric security (fingerprint or face recognition), Keeping your operating system and apps updated, Only downloading apps from official stores, Reviewing app permissions regularly, and Enabling remote wipe capability in case of loss or theft.",
          tips: [
            "A 6-digit PIN is much more secure than a 4-digit one",
            "Set your phone to lock automatically after 30 seconds",
            "Consider using a password manager app"
          ]
        },
        {
          title: "Computer Security",
          text: "Computers need protection too: Install and keep antivirus software updated, Use a firewall (most operating systems have built-in ones), Be careful when downloading software - use official sources, Keep your operating system updated, Use strong passwords for your user account, Enable full-disk encryption for sensitive data, and Lock your computer when stepping away.",
          tips: [
            "Set up automatic updates for your operating system",
            "Regular backups protect you from ransomware and hardware failure",
            "Use different user accounts if sharing a computer"
          ],
          warning: "Public computers may have keyloggers or malware. Avoid logging into sensitive accounts on shared devices."
        },
        {
          title: "Public WiFi Safety",
          text: "Public WiFi networks can be dangerous: Avoid accessing sensitive accounts (banking, email) on public WiFi, Use a VPN (Virtual Private Network) for added security, Verify the network name with the establishment, Turn off auto-connect to WiFi networks, Disable file sharing when on public networks, and Consider using your mobile data for sensitive tasks.",
          tips: [
            "A VPN encrypts your internet traffic, protecting it from eavesdroppers",
            "Hackers can create fake WiFi networks with similar names to legitimate ones",
            "If you must use public WiFi, stick to browsing non-sensitive websites"
          ]
        },
        {
          title: "Lost or Stolen Device",
          text: "Prepare for device loss before it happens: Set up Find My Device features (Find My iPhone, Google Find My Device), Record your device's IMEI number (dial *#06# on most phones), Know how to remotely lock or wipe your device, Keep regular backups, and Report theft to both police and your service provider.",
          tips: [
            "Test your device tracking features before you need them",
            "If your device is stolen, change passwords for important accounts immediately",
            "Consider what apps have auto-login enabled"
          ]
        }
      ],
      quiz: [
        {
          question: "What is a secure way to protect your phone?",
          options: ["No passcode for convenience", "Using your birthday as your PIN", "A 6+ digit PIN plus biometric authentication", "Sharing your passcode with friends"],
          correctIndex: 2,
          explanation: "Combining a strong PIN with biometric security provides multiple layers of protection."
        },
        {
          question: "Why should you be careful with public WiFi?",
          options: ["It's too slow", "Others could potentially intercept your data", "It costs money", "It drains battery faster"],
          correctIndex: 1,
          explanation: "Public WiFi can be monitored by hackers who can potentially intercept sensitive information."
        },
        {
          question: "What should you do if your device is stolen?",
          options: ["Wait and hope it's returned", "Only buy a new one", "Remotely lock/wipe it and change passwords", "Nothing - the passcode protects it"],
          correctIndex: 2,
          explanation: "Quick action to lock or wipe the device and change passwords prevents unauthorized access to your accounts."
        }
      ]
    },
    {
      id: "8",
      title: "Online Reputation Management",
      description: "Control your digital footprint and online presence",
      icon: Globe,
      duration: "8 min",
      completed: false,
      category: "Privacy",
      content: [
        {
          title: "Understanding Your Digital Footprint",
          text: "Your digital footprint is the trail of data you leave behind when using the internet. It includes: Social media posts and comments, Website accounts you've created, Online purchases, Photos tagged with your name, Reviews you've written, and Data collected by websites and apps. This footprint can affect your reputation, job opportunities, and personal relationships.",
          tips: [
            "Search your name regularly to see what comes up",
            "Your digital footprint is nearly permanent",
            "Both active posts and passive data collection contribute to your footprint"
          ]
        },
        {
          title: "Auditing Your Online Presence",
          text: "Take control by auditing what's online about you: Google your name in regular and incognito mode, Check old social media accounts you may have forgotten, Review tagged photos across platforms, Look at old forum posts or blog comments, Check data broker sites that may have your information, and Review privacy settings on all accounts.",
          tips: [
            "Use Google Alerts to monitor new content about your name",
            "Consider using Have I Been Pwned to check if your email has been in data breaches",
            "Old accounts can be security risks - close ones you don't use"
          ]
        },
        {
          title: "Cleaning Up Your Footprint",
          text: "Reduce your digital footprint by: Deleting old accounts you no longer use, Removing or hiding embarrassing old posts, Requesting removal from data broker sites, Adjusting privacy settings to limit data collection, Using privacy-focused browsers and search engines, and Being mindful about future posts and activities.",
          tips: [
            "Many platforms allow you to download your data before deleting",
            "Some sites have opt-out processes for data removal",
            "Consider using tools like DeleteMe to help with data broker removal"
          ],
          warning: "Deleting something doesn't guarantee it's gone forever - cached versions and screenshots may exist."
        },
        {
          title: "Building a Positive Online Presence",
          text: "Proactively shape your digital reputation: Create professional profiles that highlight your skills, Share content that reflects your values positively, Engage thoughtfully in online discussions, Build a personal website or portfolio if relevant, Connect with positive professional networks, and Think about your online presence as your personal brand.",
          tips: [
            "Employers and schools often search for candidates online",
            "Quality over quantity - meaningful content is better than constant posting",
            "Your online presence can open doors to opportunities"
          ]
        }
      ],
      quiz: [
        {
          question: "What is a digital footprint?",
          options: ["A type of computer virus", "The trail of data you leave when using the internet", "Your computer's storage space", "A social media feature"],
          correctIndex: 1,
          explanation: "Your digital footprint is all the data about you that exists online from your activities."
        },
        {
          question: "How can you audit your online presence?",
          options: ["It's impossible to know what's online about you", "Google yourself and check old accounts", "Only check Facebook", "Ask friends what they've seen"],
          correctIndex: 1,
          explanation: "Regular self-searches and reviewing old accounts helps you understand and manage your online presence."
        },
        {
          question: "Why does your online reputation matter?",
          options: ["It doesn't matter at all", "Only for celebrities", "It can affect job opportunities and relationships", "Only for social media influencers"],
          correctIndex: 2,
          explanation: "Employers, schools, and potential partners often look at online presence, making reputation management important for everyone."
        }
      ]
    },
    {
      id: "9",
      title: "Supporting Others Online",
      description: "How to help friends and family stay safe digitally",
      icon: Heart,
      duration: "7 min",
      completed: false,
      category: "Community",
      content: [
        {
          title: "Being an Upstander, Not a Bystander",
          text: "When you witness online harassment or abuse, you have the power to help. An upstander takes positive action when they see something wrong. You can: Reach out privately to the person being targeted to offer support, Report harmful content to the platform, Don't engage with or share harassing content, Publicly support the target if appropriate, and Document incidents in case evidence is needed later.",
          tips: [
            "Sometimes just knowing someone cares can make a huge difference",
            "You don't have to confront the harasser directly",
            "Small acts of kindness online create a more positive environment"
          ]
        },
        {
          title: "Having Safety Conversations",
          text: "Talking about digital safety with loved ones is important. Approach these conversations by: Choosing a comfortable time and setting, Listening without judgment, Sharing your own experiences and concerns, Focusing on safety rather than restricting freedom, Offering to help set up security features, and Being patient - behavior change takes time.",
          tips: [
            "Avoid fear-mongering - focus on empowerment",
            "Respect their autonomy while sharing your concerns",
            "Offer ongoing support rather than one-time lectures"
          ]
        },
        {
          title: "Helping Harassment Victims",
          text: "If someone you know is experiencing online harassment: Believe them and validate their feelings, Don't blame them for what's happening, Help them document and report if they want, Offer practical help (staying with them, helping with reports), Encourage professional support if needed, and Be patient - recovery takes time.",
          warning: "Never share details about someone's harassment without their permission."
        },
        {
          title: "Teaching Children and Teens",
          text: "Young people need age-appropriate digital safety education: Start conversations early about online safety, Teach them about privacy and what's okay to share, Explain that online actions have real consequences, Help them recognize manipulation and grooming, Create an environment where they feel safe telling you about problems, and Model good digital behavior yourself.",
          tips: [
            "Use news stories as conversation starters",
            "Focus on critical thinking skills rather than just rules",
            "Keep communication lines open - don't make them afraid to come to you"
          ]
        }
      ],
      quiz: [
        {
          question: "What is an upstander?",
          options: ["Someone who causes problems online", "Someone who ignores online harassment", "Someone who takes positive action when witnessing harm", "Someone who only posts positive content"],
          correctIndex: 2,
          explanation: "An upstander actively helps when they see someone being harassed or harmed online."
        },
        {
          question: "How should you approach a safety conversation with a loved one?",
          options: ["With criticism and judgment", "By restricting their internet access", "With empathy, listening, and offers of help", "By ignoring their online activities"],
          correctIndex: 2,
          explanation: "Supportive, non-judgmental conversations are more effective than criticism or control."
        },
        {
          question: "What's the most important thing when helping a harassment victim?",
          options: ["Immediately confronting the harasser", "Believing them and not blaming them", "Taking over and handling everything yourself", "Sharing their story to raise awareness"],
          correctIndex: 1,
          explanation: "Believing and supporting the victim without blame is crucial for their recovery and trust."
        }
      ]
    }
  ];

  const totalLessons = lessons.length;
  const progress = (completedLessons.length / totalLessons) * 100;
  const activeLesson = lessons.find(l => l.id === activeLessonId);

  if (loading) return null;

  const badges = [
    { name: "First Steps", icon: "🌱", earned: completedLessons.length >= 1, description: "Complete your first lesson" },
    { name: "Safety Scholar", icon: "📚", earned: completedLessons.length >= 3, description: "Complete 3 lessons" },
    { name: "Digital Guardian", icon: "🛡️", earned: completedLessons.length >= 6, description: "Complete 6 lessons" },
    { name: "Safety Expert", icon: "🏆", earned: completedLessons.length >= 9, description: "Complete all lessons" },
  ];

  const categories = [...new Set(lessons.map(l => l.category))];

  const quickTips = [
    { icon: Lock, title: "Use Strong Passwords", text: "Create unique passwords with 12+ characters for each account" },
    { icon: Eye, title: "Review Privacy Settings", text: "Check your social media privacy settings monthly" },
    { icon: AlertTriangle, title: "Trust Your Instincts", text: "If something feels wrong online, it probably is" },
    { icon: Shield, title: "Document Everything", text: "Screenshot harassment evidence with dates and URLs" },
    { icon: Smartphone, title: "Update Regularly", text: "Keep your devices and apps updated for security" },
    { icon: Users, title: "Build Support Network", text: "Don't face online harassment alone - reach out for help" },
  ];

  const resources = [
    { title: "Kenya Cyber Crime Unit", description: "Report cybercrimes to DCI", link: "https://www.dci.go.ke" },
    { title: "COVAW Kenya", description: "Coalition on Violence Against Women", link: "tel:+254800720553" },
    { title: "NetSafe", description: "Online safety resources and reporting", link: "https://www.netsafe.org.nz" },
    { title: "Cyber Civil Rights", description: "Fighting online abuse", link: "https://cybercivilrights.org" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom duration-700">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Digital Literacy <span className="text-primary">Hub</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Empower yourself with knowledge. Learn to navigate the digital world safely and confidently through interactive lessons and quizzes.
          </p>
        </div>

        {/* Progress Section */}
        <Card className="p-6 mb-8 shadow-medium animate-in fade-in slide-in-from-bottom duration-700 delay-100">
          <div className="flex items-center gap-4 mb-4">
            <TrendingUp className="h-6 w-6 text-primary" />
            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Your Learning Progress</h3>
                <span className="text-sm font-medium">{completedLessons.length}/{totalLessons} Lessons Completed</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
          </div>
          
          {/* Badges */}
          <div className="flex gap-4 pt-4 border-t">
            <Award className="h-5 w-5 text-accent mt-1" />
            <div className="flex-1">
              <h4 className="font-medium mb-3">Achievement Badges</h4>
              <div className="flex gap-3 flex-wrap">
                {badges.map((badge) => (
                  <div key={badge.name} className="group relative">
                    <Badge
                      variant={badge.earned ? "default" : "outline"}
                      className={`px-3 py-2 cursor-help ${badge.earned ? 'shadow-glow' : 'opacity-50'}`}
                    >
                      <span className="mr-2">{badge.icon}</span>
                      {badge.name}
                    </Badge>
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {badge.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
            <TabsTrigger value="lessons" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Lessons
            </TabsTrigger>
            <TabsTrigger value="tips" className="gap-2">
              <Lightbulb className="h-4 w-4" />
              Quick Tips
            </TabsTrigger>
            <TabsTrigger value="resources" className="gap-2">
              <HelpCircle className="h-4 w-4" />
              Resources
            </TabsTrigger>
          </TabsList>

          {/* Lessons Tab */}
          <TabsContent value="lessons" className="space-y-6">
            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              <Badge variant="secondary" className="cursor-pointer">All Topics</Badge>
              {categories.map(category => (
                <Badge key={category} variant="outline" className="cursor-pointer hover:bg-primary/10">
                  {category}
                </Badge>
              ))}
            </div>

            {/* Lessons Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lessons.map((lesson, index) => {
                const Icon = lesson.icon;
                const isCompleted = completedLessons.includes(lesson.id);
                
                return (
                  <Card
                    key={lesson.id}
                    className={`p-6 cursor-pointer transition-smooth hover:shadow-medium hover:-translate-y-1 animate-in fade-in slide-in-from-bottom duration-700 ${isCompleted ? 'border-primary/30 bg-primary/5' : ''}`}
                    style={{ animationDelay: `${(index + 2) * 50}ms` }}
                    onClick={() => handleStartLesson(lesson.id)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl ${isCompleted ? 'bg-primary/20' : 'bg-muted'}`}>
                        <Icon className={`h-6 w-6 ${isCompleted ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      {isCompleted && (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    
                    <Badge variant="outline" className="mb-3">
                      {lesson.category}
                    </Badge>
                    
                    <h3 className="font-semibold text-lg mb-2">{lesson.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {lesson.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{lesson.duration}</span>
                        <span>•</span>
                        <span>{lesson.content.length} sections</span>
                        <span>•</span>
                        <span>{lesson.quiz.length} quiz questions</span>
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      variant={isCompleted ? "outline" : "default"}
                      className="w-full mt-4 gap-2"
                    >
                      <Play className="h-4 w-4" />
                      {isCompleted ? "Review Lesson" : "Start Lesson"}
                    </Button>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Quick Tips Tab */}
          <TabsContent value="tips" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickTips.map((tip, index) => {
                const Icon = tip.icon;
                return (
                  <Card key={index} className="p-5 hover:shadow-medium transition-smooth">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">{tip.title}</h4>
                        <p className="text-sm text-muted-foreground">{tip.text}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Safety Checklist */}
            <Card className="p-6 mt-8">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Daily Safety Checklist
                </CardTitle>
                <CardDescription>Quick actions to boost your digital safety</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-3">
                  {[
                    "Check privacy settings on your most-used social media app",
                    "Update one password that you haven't changed in a while",
                    "Review app permissions on your phone",
                    "Check for software updates on your devices",
                    "Remove a friend or follower you don't recognize",
                    "Back up important files or photos"
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                      <div className="h-5 w-5 rounded border-2 border-primary/30 shrink-0" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              {resources.map((resource, index) => (
                <Card key={index} className="p-5 hover:shadow-medium transition-smooth">
                  <h4 className="font-semibold mb-1">{resource.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{resource.description}</p>
                  <Button variant="outline" size="sm" asChild>
                    <a href={resource.link} target="_blank" rel="noopener noreferrer">
                      Learn More
                    </a>
                  </Button>
                </Card>
              ))}
            </div>

            {/* FAQ Section */}
            <Card className="p-6 mt-8">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>What should I do if I'm being harassed online?</AccordionTrigger>
                    <AccordionContent>
                      First, don't engage with the harasser. Document everything by taking screenshots with dates and URLs. Report the harassment to the platform using their official reporting tools. If you feel threatened, contact local authorities. Reach out to trusted friends, family, or support organizations. Remember, you're not alone and it's not your fault.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>How can I tell if a message is a phishing attempt?</AccordionTrigger>
                    <AccordionContent>
                      Phishing messages often create urgency or fear, ask for personal information or passwords, contain suspicious links, have poor grammar or spelling, come from unknown senders or addresses that look similar to legitimate ones. When in doubt, don't click any links and verify the request through official channels.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger>What's the best way to create strong passwords?</AccordionTrigger>
                    <AccordionContent>
                      Use a passphrase with random words, numbers, and special characters (like "Purple-Elephant-Dancing-Rain2024!"). Make it at least 12 characters long. Use different passwords for each account. Consider using a password manager to generate and store unique passwords. Enable two-factor authentication wherever possible.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-4">
                    <AccordionTrigger>How do I report cybercrime in Kenya?</AccordionTrigger>
                    <AccordionContent>
                      You can report cybercrimes to the Directorate of Criminal Investigations (DCI) Cyber Crime Unit. Keep all evidence including screenshots, URLs, and any relevant communications. You can also report to the Communications Authority of Kenya (CA) for issues related to telecommunications. For immediate threats, contact police emergency services at 999 or 112.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-5">
                    <AccordionTrigger>Is it safe to use public WiFi?</AccordionTrigger>
                    <AccordionContent>
                      Public WiFi can be risky because others on the network might intercept your data. Avoid accessing sensitive accounts (banking, email) on public WiFi. Use a VPN for added security. Make sure you're connecting to the legitimate network, not a fake one. When possible, use your mobile data for sensitive activities.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Completion Message */}
        {progress === 100 && (
          <Card className="mt-8 p-8 text-center gradient-accent text-white shadow-strong animate-in fade-in slide-in-from-bottom">
            <Award className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Congratulations! 🎉</h3>
            <p className="text-white/90">
              You've completed all lessons. You're now a Digital Safety Expert!
            </p>
          </Card>
        )}
      </main>

      {/* Lesson Dialog */}
      <Dialog open={!!activeLessonId} onOpenChange={() => handleCloseLesson()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {activeLesson && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <activeLesson.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <DialogTitle className="text-xl">{activeLesson.title}</DialogTitle>
                      <DialogDescription>{activeLesson.description}</DialogDescription>
                    </div>
                  </div>
                  <Badge variant="outline">{activeLesson.category}</Badge>
                </div>
                
                {/* Progress indicator */}
                <div className="flex items-center gap-2 mt-4">
                  <Progress 
                    value={showQuiz ? 100 : ((currentSlide + 1) / activeLesson.content.length) * 100} 
                    className="h-2 flex-1" 
                  />
                  <span className="text-sm text-muted-foreground">
                    {showQuiz ? "Quiz" : `${currentSlide + 1}/${activeLesson.content.length}`}
                  </span>
                </div>
              </DialogHeader>

              {!showQuiz ? (
                /* Lesson Content */
                <div className="py-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Zap className="h-5 w-5 text-primary" />
                      {activeLesson.content[currentSlide].title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {activeLesson.content[currentSlide].text}
                    </p>
                    
                    {activeLesson.content[currentSlide].warning && (
                      <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                          <p className="text-sm">{activeLesson.content[currentSlide].warning}</p>
                        </div>
                      </div>
                    )}
                    
                    {activeLesson.content[currentSlide].tips && (
                      <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-primary" />
                          Key Tips
                        </h4>
                        <ul className="space-y-2">
                          {activeLesson.content[currentSlide].tips?.map((tip, index) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  {/* Navigation */}
                  <div className="flex items-center justify-between mt-8 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                      disabled={currentSlide === 0}
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    
                    {currentSlide < activeLesson.content.length - 1 ? (
                      <Button onClick={() => setCurrentSlide(prev => prev + 1)}>
                        Next
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    ) : (
                      <Button onClick={() => setShowQuiz(true)}>
                        Take Quiz
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                /* Quiz Section */
                <div className="py-4 space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Knowledge Check</h3>
                  </div>
                  
                  {activeLesson.quiz.map((q, qIndex) => (
                    <div key={qIndex} className="p-4 bg-muted/50 rounded-lg space-y-3">
                      <p className="font-medium">{qIndex + 1}. {q.question}</p>
                      <RadioGroup
                        value={quizAnswers[qIndex]?.toString()}
                        onValueChange={(value) => setQuizAnswers({...quizAnswers, [qIndex]: parseInt(value)})}
                        disabled={quizSubmitted}
                      >
                        {q.options.map((option, oIndex) => (
                          <div key={oIndex} className={`flex items-center space-x-2 p-2 rounded ${
                            quizSubmitted && oIndex === q.correctIndex 
                              ? 'bg-green-100 dark:bg-green-900/30' 
                              : quizSubmitted && quizAnswers[qIndex] === oIndex && oIndex !== q.correctIndex
                              ? 'bg-red-100 dark:bg-red-900/30'
                              : ''
                          }`}>
                            <RadioGroupItem value={oIndex.toString()} id={`q${qIndex}-o${oIndex}`} />
                            <Label htmlFor={`q${qIndex}-o${oIndex}`} className="cursor-pointer flex-1">
                              {option}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                      {quizSubmitted && (
                        <p className="text-sm text-muted-foreground mt-2 p-2 bg-background rounded">
                          <strong>Explanation:</strong> {q.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <Button variant="outline" onClick={() => setShowQuiz(false)}>
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Review Lesson
                    </Button>
                    
                    {!quizSubmitted ? (
                      <Button 
                        onClick={handleQuizSubmit}
                        disabled={Object.keys(quizAnswers).length < activeLesson.quiz.length}
                      >
                        Submit Answers
                      </Button>
                    ) : (
                      <Button onClick={() => handleCompleteLesson(activeLesson.id)}>
                        {completedLessons.includes(activeLesson.id) ? 'Close' : 'Complete Lesson'}
                        <CheckCircle2 className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Learn;
