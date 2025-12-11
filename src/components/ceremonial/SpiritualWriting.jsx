import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scroll, BookOpen, Heart, Users, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function SpiritualWriting() {
  const principles = [
    {
      number: 1,
      title: "Writing Allows Me to Reflect on My Spiritual Journey",
      icon: BookOpen,
      color: "from-purple-600 to-indigo-600",
      scripture: "\"I am the Alpha and the Omega, the First and the Last,\" and \"What you see, write in a book and send it to the seven churches which are in Asia.\" - Revelation 1:11",
      content: "In the book of Revelation, God instructs John to write down His divine messages. This speaks to the deep significance of recording and preserving our spiritual insights. Writing allows us to capture our thoughts, reflections, and experiences, providing us with an opportunity to reflect on God's work in our lives and gain a clearer understanding of our spiritual journey."
    },
    {
      number: 2,
      title: "Writing Strengthens My Relationship with God",
      icon: Heart,
      color: "from-pink-600 to-rose-600",
      scripture: "These things I have written to you who believe in the name of the Son of God, that you may know that you have eternal life, and that you may continue to believe in the name of the Son of God. - I John 5:13",
      content: "Through writing, we can deepen our connection with God. By writing down what He is teaching me and the experiences He is allowing me to go through, I can be assured of His presence and adjust my life to His divine purpose. Writing not only strengthens my faith but also serves as a powerful reminder of God's faithfulness, even in times of doubt or struggle."
    },
    {
      number: 3,
      title: "Writing Allows Me to Clarify My Thoughts and Direction",
      icon: Sparkles,
      color: "from-cyan-600 to-blue-600",
      scripture: "For the word of God is living and powerful, and sharper than any two-edged sword, piercing even to the division of soul and spirit, and of joints and marrow, and is a discerner of the thoughts and intents of the heart. - Hebrews 4:12",
      content: "Writing allows us to delve deeper into our thoughts, emotions, and innermost desires. Writing allows us to articulate our thoughts and ideas with precision. Consistent journaling is a discipline that can help us stay focused and remind us of God's work in our lives. By putting pen to paper, we invite God's transformative power into our lives, allowing Him to mold and guide us."
    },
    {
      number: 4,
      title: "Writing Encouraging Others",
      icon: Users,
      color: "from-green-600 to-emerald-600",
      scripture: "Let no corrupt word proceed out of your mouth, but what is good for necessary edification, that it may impart grace to the hearers. - Ephesians 4:29",
      content: "Writing is not limited to personal reflections; it can also be used to encourage and build up others. Through our writings, we can influence those who read our words. Whether through text messages, handwritten cards, emails, or blog posts, we can bring comfort, inspiration, and hope to others by sharing our faith and spiritual journey. God will oftentimes use a simple, encouraging word to change the trajectory of a person's day."
    },
    {
      number: 5,
      title: "Writing Leaves a Legacy",
      icon: Scroll,
      color: "from-amber-600 to-orange-600",
      scripture: "And these words which I command you today shall be in your heart. You shall teach them diligently to your children... You shall write them on the doorposts of your house and on your gates. - Deuteronomy 6:6-9",
      content: "Writing serves as a testament to future generations. By penning down our faith, values, and experiences, we create a legacy that can inspire and guide our children, grandchildren, and even beyond. Our written words can encapsulate the wisdom gained over a lifetime, ensuring that our spiritual insights and teachings continue to impact others long after we are gone."
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-950/60 to-indigo-950/60 border-purple-500/50">
        <CardHeader>
          <CardTitle className="text-purple-200 flex items-center gap-2">
            <Scroll className="w-5 h-5" />
            The Written Word • Spiritual Manifestation Through Scripture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-purple-300/70 leading-relaxed mb-4">
            Incorporating writing into our lives as Christians can be a truly transformative practice. Not only does it strengthen 
            our relationship with God and help us grow spiritually, but it also blesses others and leaves a lasting legacy. Through 
            writing, we have the power to inspire and encourage.
          </p>
          <div className="p-4 bg-purple-950/30 rounded-lg border border-purple-500/30">
            <p className="text-sm text-purple-200 italic">
              "Though not many will ever publish a book, each of us who have a relationship with Jesus Christ has a story to tell. 
              Would you consider taking the challenge to begin writing? Begin small. Write a sentence or two reflecting on your day 
              and God's work in your life. Move on to intentionally encouraging others in their walk with Christ. You might just be 
              surprised at what God does as you echo His love and grace."
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Five Principles */}
      <div className="space-y-4">
        {principles.map((principle, i) => {
          const Icon = principle.icon;
          return (
            <motion.div
              key={principle.number}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="bg-slate-900/60 border-purple-900/40">
                <CardHeader className="border-b border-purple-900/30">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 bg-gradient-to-br ${principle.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 mb-2">
                        Principle {principle.number}
                      </Badge>
                      <CardTitle className="text-purple-200 text-lg">
                        {principle.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="p-3 bg-indigo-950/30 rounded-lg border border-indigo-500/30">
                    <div className="text-xs text-indigo-400/70 mb-1 font-semibold">Scripture</div>
                    <p className="text-sm text-indigo-200 italic">{principle.scripture}</p>
                  </div>
                  
                  <p className="text-sm text-purple-300/80 leading-relaxed">
                    {principle.content}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-amber-950/40 to-orange-950/40 border-amber-500/30">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            <h3 className="font-semibold text-amber-200">Your Story Matters</h3>
          </div>
          <p className="text-sm text-amber-300/70 leading-relaxed mb-4">
            Each of us who have a relationship with Jesus Christ has a story to tell. Your written words can encapsulate the 
            wisdom gained over a lifetime, ensuring that your spiritual insights and teachings continue to impact others long 
            after you are gone.
          </p>
          <div className="p-4 bg-amber-950/30 rounded-lg border border-amber-500/30">
            <p className="text-sm text-amber-200 font-semibold mb-2">
              "Writing not only strengthens my faith but also serves as a powerful reminder of God's faithfulness."
            </p>
            <p className="text-xs text-amber-400/70 italic">
              God will oftentimes use a simple, encouraging word to change the trajectory of a person's day.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Testimony */}
      <Card className="bg-slate-900/60 border-purple-900/40">
        <CardHeader className="border-b border-purple-900/30">
          <CardTitle className="text-purple-200 text-base">Testimony • The Power of Written Legacy</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-sm text-purple-300/70 leading-relaxed">
            In the first church where I served as a senior pastor, there was a lady who made it a consistent practice to write 
            hand-written letters to her grandchildren. She did this from the time they were infants. Her reason for doing so was 
            that she wanted her grandchildren to see in her own handwriting the love she had for them, the love she had for God, 
            and most importantly, the love that God had for them.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}