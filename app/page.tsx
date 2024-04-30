"use client";
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import axios from "axios";
import { CircleCheck } from "lucide-react";

const formSchema = z.object({
	airport: z.string(),
	flight: z.string().regex(/^[A-Za-z0-9]+$/, "只能包含英文大小寫和數字"),
	name: z.string().regex(/^[A-Za-z ]*$/, "只能包含英文大小寫和空格"),
	tel: z.string().regex(/^[0-9]+$/, "只能包含數字"),
	identity: z.string().regex(/^[A-Za-z0-9]+$/, "只能包含英文大小寫和數字"),
	rideNotes: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

const Home: React.FC = () => {
	const [open, setOpen] = useState<boolean>(false);
	const [flight, setFlight] = useState<string>("");
	const [isFlightExist, setIsFlightExist] = useState<boolean>(false);
	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		mode: "onBlur",
		defaultValues: {
			airport: "",
			flight: "",
			name: "",
			tel: "",
			identity: "",
			rideNotes: "",
		},
	});
	const {
		handleSubmit,
		control,
		formState: { errors },
	} = form;

	async function onSubmit(values: FormValues) {
		const { flight } = values;
		setFlight(flight);
		try {
			const { data } = await axios.get<
				{ AirlineID: string; FlightNumber: string }[]
			>(
				"https://tdx.transportdata.tw/api/basic/v2/Air/FIDS/Airport/Departure/TPE?$orderby=ScheduleDepartureTime&$format=JSON"
			);
			setOpen(true);
			const flightExists = data.some(
				(item) => item.AirlineID + item.FlightNumber === flight
			);
			setIsFlightExist(flightExists);
		} catch (error) {
			console.error("Error fetching flight data:", error);
		}
	}

	return (
		<div className="flex justify-center items-center m-auto rounded-3xl">
			<div className="flex flex-col m-auto  w-[400px] p-10 bg-white rounded-3xl justify-center gap-4">
				<h1 className="text-center text-xl">送機行程</h1>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
						<FormField
							control={form.control}
							name="airport"
							render={({ field }) => (
								<FormItem>
									<FormLabel>下車機場</FormLabel>
									<FormControl>
										<Input
											disabled
											placeholder="桃園國際機場 第一航廈"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="flight"
							render={({ field }) => (
								<FormItem>
									<FormLabel>航班編號</FormLabel>
									<FormControl>
										<Input
											className={errors.flight ? "border-red-500" : ""}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>姓名</FormLabel>
									<FormControl>
										<Input
											className={errors.name ? "border-red-500" : ""}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="tel"
							render={({ field }) => (
								<FormItem>
									<FormLabel>電話</FormLabel>
									<FormControl>
										<Input
											className={errors.tel ? "border-red-500" : ""}
											type="tel"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="identity"
							render={({ field }) => (
								<FormItem>
									<FormLabel>身分證字號/護照編號</FormLabel>
									<FormControl>
										<Input
											className={errors.identity ? "border-red-500" : ""}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="rideNotes"
							render={({ field }) => (
								<FormItem>
									<FormLabel>乘車備註</FormLabel>
									<FormControl>
										<Textarea {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button
							type="submit"
							className="w-full bg-slate-700 text-white font-bold hover:bg-slate-500"
						>
							下一步
						</Button>
					</form>
				</Form>
				<Drawer open={open} onOpenChange={setOpen}>
					<DrawerContent>
						{isFlightExist ? (
							<DrawerHeader>
								<DrawerTitle className="flex flex-col items-center gap-3">
									<CircleCheck size="64" color="#21aed2" />
									<DrawerDescription>完成送機行程</DrawerDescription>
								</DrawerTitle>
							</DrawerHeader>
						) : (
							<>
								<DrawerHeader>
									<DrawerTitle className="text-center">
										找不到「{flight}」航班資訊{" "}
									</DrawerTitle>
									<DrawerDescription className="text-center">
										請確認航班資訊、起飛時間等，你也可以直接填寫此航班作為機場接送資訊
									</DrawerDescription>
								</DrawerHeader>
								<DrawerFooter>
									<Button
										className="w-full bg-slate-700 text-white font-bold hover:bg-slate-500"
										onClick={() => setIsFlightExist(true)}
									>
										確認航班資訊，並送出
									</Button>
									<DrawerClose asChild>
										<Button variant="outline">重新填寫</Button>
									</DrawerClose>
								</DrawerFooter>
							</>
						)}
					</DrawerContent>
				</Drawer>
			</div>
		</div>
	);
};

export default Home;
