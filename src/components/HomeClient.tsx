'use client'
import React, { useState } from 'react'
import { motion } from "motion/react"
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { LogOutIcon, LayoutDashboardIcon } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function HomeClient({ email }: { email: string }) {
    const [loading, setLoading] = useState(false)
    const handleLogin = () => {
        setLoading(true)
        window.location.href = "/api/auth/login"
    }
    const firstLetter = email ? email[0].toUpperCase() : ""
    const navigate = useRouter()

    const features = [
        {
            title: "Plug & Play",
            desc: "Add the chatbot to your site with a single script tag."
        },
        {
            title: "Multiple Chatbots",
            desc: "Create separate chatbots for each of your businesses or products."
        },
        {
            title: "Admin Controlled",
            desc: "You control exactly what the AI knows and answers."
        },
        {
            title: "Always Online",
            desc: "Your customers get instant support 24/7."
        }
    ]

    const handleLogOut = async () => {
        try {
            await axios.get("/api/auth/logout")
            window.location.href = "/"
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className='min-h-screen bg-background text-foreground overflow-x-hidden'>
            <motion.div
                initial={{ y: -50 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
                className='fixed top-0 left-0 w-full z-50 bg-background/70 backdrop-blur-xl border-b'
            >
                <div className='max-w-7xl mx-auto px-6 h-14 flex items-center justify-between'>
                    <div className='text-lg font-semibold tracking-tight'>Ploppy</div>
                    {email ? (
                        <div className="flex items-center gap-3">
                            <Button variant="outline" size="sm" onClick={() => navigate.push("/dashboard")}>
                                <LayoutDashboardIcon className="mr-2 size-4" />
                                Dashboard
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className='size-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm hover:opacity-90 transition'>
                                        {firstLetter}
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem disabled>
                                        <span className="text-xs text-muted-foreground">{email}</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => navigate.push("/dashboard")}>
                                        <LayoutDashboardIcon className="mr-2 size-4" />
                                        Dashboard
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleLogOut}>
                                        <LogOutIcon className="mr-2 size-4" />
                                        Logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ) : (
                        <Button onClick={handleLogin} disabled={loading}>
                            {loading ? "Loading..." : "Login"}
                        </Button>
                    )}
                </div>
            </motion.div>

            <section className='pt-36 pb-28 px-6'>
                <div className='max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center'>
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                    >
                        <h1 className='text-4xl md:text-5xl font-semibold leading-tight'>
                            AI Customer Support <br />
                            Built for Modern Websites
                        </h1>
                        <p className='mt-6 text-lg text-muted-foreground max-w-xl'>
                            Add powerful AI chatbots to your website in minutes.
                            Create multiple chatbots for each of your businesses with their own knowledge bases.
                        </p>
                        <div className='mt-10 flex gap-4'>
                            {email ? (
                                <Button size="lg" onClick={() => navigate.push("/dashboard")}>
                                    Go to Dashboard
                                </Button>
                            ) : (
                                <Button size="lg" onClick={handleLogin} disabled={loading}>
                                    Get Started
                                </Button>
                            )}
                            <Button variant="outline" size="lg" asChild>
                                <a href='#feature'>Learn More</a>
                            </Button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="relative"
                    >
                        <div className='rounded-2xl bg-card shadow-2xl border p-6'>
                            <div className='text-sm text-muted-foreground mb-3'>Live Chat Preview</div>
                            <div className='space-y-3'>
                                <div className='bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm ml-auto w-fit'>
                                    Do you offer cash on delivery?
                                </div>
                                <div className='bg-muted rounded-lg px-4 py-2 text-sm w-fit'>
                                    Yes, Cash On Delivery is available.
                                </div>
                            </div>
                            <motion.div
                                animate={{ y: [0, -12, 0] }}
                                transition={{ repeat: Infinity, duration: 3 }}
                                className="absolute -bottom-6 -right-6 size-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xl text-lg"
                            >
                                💬
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>

            <section
                id='feature'
                className="bg-muted/50 py-28 px-6 border-t"
            >
                <div className='max-w-6xl mx-auto'>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false }}
                        transition={{ duration: 0.5 }}
                        className='text-3xl font-semibold text-center'
                    >
                        Why Businesses Choose Ploppy
                    </motion.h2>

                    <div className='mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                        {features.map((f, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: false }}
                                className="bg-card rounded-xl p-6 shadow-sm border"
                            >
                                <h3 className='text-base font-medium'>{f.title}</h3>
                                <p className='mt-2 text-muted-foreground text-sm'>{f.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <footer className='py-10 text-center text-sm text-muted-foreground'>
                &copy; {new Date().getFullYear()} Ploppy. All rights reserved.
            </footer>
        </div>
    )
}

export default HomeClient
